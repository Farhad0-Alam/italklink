import { Router } from "express";
import { z } from "zod";
import { eq, desc, sql, and, ilike, or } from "drizzle-orm";
import { db } from "./db";
import { 
  templateCollections, 
  templateCollectionItems, 
  templateCollectionLikes, 
  templateCollectionComments,
  users,
  businessCards,
  globalTemplates,
  createTemplateCollectionSchema,
  updateTemplateCollectionSchema,
  addTemplateToCollectionSchema
} from "../shared/schema";
import { nanoid } from "nanoid";

const router = Router();

// Get all collections (public and user's private ones)
router.get("/", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { search, tags, sort = 'recent', page = 1, limit = 12 } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build base query
    const baseQuery = db
      .select({
        id: templateCollections.id,
        name: templateCollections.name,
        description: templateCollections.description,
        isPublic: templateCollections.isPublic,
        shareSlug: templateCollections.shareSlug,
        templateCount: templateCollections.templateCount,
        viewCount: templateCollections.viewCount,
        tags: templateCollections.tags,
        createdAt: templateCollections.createdAt,
        updatedAt: templateCollections.updatedAt,
        creatorId: users.id,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName,
        creatorProfileImageUrl: users.profileImageUrl,
      })
      .from(templateCollections)
      .leftJoin(users, eq(templateCollections.createdBy, users.id));

    // Build where conditions
    const whereConditions = [];
    
    // Filter by public collections or user's own collections
    if (userId) {
      whereConditions.push(
        or(
          eq(templateCollections.isPublic, true),
          eq(templateCollections.createdBy, userId)
        )
      );
    } else {
      whereConditions.push(eq(templateCollections.isPublic, true));
    }

    // Apply search filter
    if (search) {
      whereConditions.push(
        or(
          ilike(templateCollections.name, `%${search}%`),
          ilike(templateCollections.description, `%${search}%`)
        )
      );
    }

    // Combine where conditions
    const finalQuery = whereConditions.length > 1 
      ? baseQuery.where(and(...whereConditions))
      : baseQuery.where(whereConditions[0]);

    // Apply sorting
    let sortedQuery;
    switch (sort) {
      case 'popular':
        sortedQuery = finalQuery.orderBy(desc(templateCollections.viewCount));
        break;
      case 'templates':
        sortedQuery = finalQuery.orderBy(desc(templateCollections.templateCount));
        break;
      case 'recent':
      default:
        sortedQuery = finalQuery.orderBy(desc(templateCollections.createdAt));
        break;
    }

    const rawCollections = await sortedQuery.limit(parseInt(limit)).offset(offset);
    
    // Transform the result to match expected format
    const collections = rawCollections.map(row => ({
      ...row,
      creator: {
        id: row.creatorId,
        firstName: row.creatorFirstName,
        lastName: row.creatorLastName,
        profileImageUrl: row.creatorProfileImageUrl,
      },
      // Remove the separate creator fields
      creatorId: undefined,
      creatorFirstName: undefined,
      creatorLastName: undefined,
      creatorProfileImageUrl: undefined,
    }));

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql`count(*)` })
      .from(templateCollections)
      .where(
        userId 
          ? or(
              eq(templateCollections.isPublic, true),
              eq(templateCollections.createdBy, userId)
            )
          : eq(templateCollections.isPublic, true)
      );

    const total = Number(totalResult[0]?.count || 0);

    res.json({
      collections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ message: "Failed to fetch collections" });
  }
});

// Get user's own collections
router.get("/my", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const collections = await db
      .select()
      .from(templateCollections)
      .where(eq(templateCollections.createdBy, userId))
      .orderBy(desc(templateCollections.createdAt));

    res.json(collections);
  } catch (error) {
    console.error("Error fetching user collections:", error);
    res.status(500).json({ message: "Failed to fetch collections" });
  }
});

// Get single collection with templates
router.get("/:id", async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.claims?.sub;

    // Get collection details
    const [rawCollection] = await db
      .select({
        id: templateCollections.id,
        name: templateCollections.name,
        description: templateCollections.description,
        isPublic: templateCollections.isPublic,
        shareSlug: templateCollections.shareSlug,
        templateCount: templateCollections.templateCount,
        viewCount: templateCollections.viewCount,
        tags: templateCollections.tags,
        createdAt: templateCollections.createdAt,
        updatedAt: templateCollections.updatedAt,
        creatorId: users.id,
        creatorFirstName: users.firstName,
        creatorLastName: users.lastName,
        creatorProfileImageUrl: users.profileImageUrl,
      })
      .from(templateCollections)
      .leftJoin(users, eq(templateCollections.createdBy, users.id))
      .where(eq(templateCollections.id, id));

    if (!rawCollection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    const collection = {
      ...rawCollection,
      creator: {
        id: rawCollection.creatorId,
        firstName: rawCollection.creatorFirstName,
        lastName: rawCollection.creatorLastName,
        profileImageUrl: rawCollection.creatorProfileImageUrl,
      }
    };

    // Check access permissions
    if (!collection.isPublic && collection.creator?.id !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get collection templates
    const templates = await db
      .select({
        id: templateCollectionItems.id,
        templateId: templateCollectionItems.templateId,
        templateType: templateCollectionItems.templateType,
        order: templateCollectionItems.order,
        addedAt: templateCollectionItems.createdAt,
      })
      .from(templateCollectionItems)
      .where(eq(templateCollectionItems.collectionId, id))
      .orderBy(templateCollectionItems.order);

    // Increment view count if not owner
    if (userId !== collection.creator?.id) {
      await db
        .update(templateCollections)
        .set({ 
          viewCount: sql`${templateCollections.viewCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(templateCollections.id, id));
    }

    res.json({
      ...collection,
      templates
    });
  } catch (error) {
    console.error("Error fetching collection:", error);
    res.status(500).json({ message: "Failed to fetch collection" });
  }
});

// Create new collection
router.post("/", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = createTemplateCollectionSchema.parse(req.body);
    const { templateIds, ...collectionData } = validatedData;

    // Generate share slug if public
    const shareSlug = collectionData.isPublic ? nanoid(8) : null;

    // Create collection
    const [collection] = await db
      .insert(templateCollections)
      .values({
        ...collectionData,
        createdBy: userId,
        shareSlug,
        templateCount: templateIds.length,
      })
      .returning();

    // Add templates to collection
    const collectionItems = templateIds.map((templateId, index) => ({
      collectionId: collection.id,
      templateId,
      templateType: 'global' as const, // Default to global templates
      order: index,
      addedBy: userId,
    }));

    await db.insert(templateCollectionItems).values(collectionItems);

    res.status(201).json(collection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Error creating collection:", error);
    res.status(500).json({ message: "Failed to create collection" });
  }
});

// Update collection
router.put("/:id", async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = updateTemplateCollectionSchema.parse(req.body);

    // Check ownership
    const [existingCollection] = await db
      .select()
      .from(templateCollections)
      .where(eq(templateCollections.id, id));

    if (!existingCollection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (existingCollection.createdBy !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Generate share slug if making public for the first time
    let shareSlug = existingCollection.shareSlug;
    if (validatedData.isPublic && !shareSlug) {
      shareSlug = nanoid(8);
    }

    const [updatedCollection] = await db
      .update(templateCollections)
      .set({
        ...validatedData,
        shareSlug,
        updatedAt: new Date(),
      })
      .where(eq(templateCollections.id, id))
      .returning();

    res.json(updatedCollection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Error updating collection:", error);
    res.status(500).json({ message: "Failed to update collection" });
  }
});

// Delete collection
router.delete("/:id", async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check ownership
    const [existingCollection] = await db
      .select()
      .from(templateCollections)
      .where(eq(templateCollections.id, id));

    if (!existingCollection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (existingCollection.createdBy !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await db.delete(templateCollections).where(eq(templateCollections.id, id));

    res.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    res.status(500).json({ message: "Failed to delete collection" });
  }
});

// Add template to collection
router.post("/:id/templates", async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const validatedData = addTemplateToCollectionSchema.parse(req.body);

    // Check ownership
    const [collection] = await db
      .select()
      .from(templateCollections)
      .where(eq(templateCollections.id, id));

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.createdBy !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if template already exists in collection
    const [existing] = await db
      .select()
      .from(templateCollectionItems)
      .where(
        and(
          eq(templateCollectionItems.collectionId, id),
          eq(templateCollectionItems.templateId, validatedData.templateId)
        )
      );

    if (existing) {
      return res.status(400).json({ message: "Template already in collection" });
    }

    // Get current max order
    const [maxOrder] = await db
      .select({ maxOrder: sql`COALESCE(MAX(${templateCollectionItems.order}), -1)` })
      .from(templateCollectionItems)
      .where(eq(templateCollectionItems.collectionId, id));

    const newOrder = Number(maxOrder.maxOrder) + 1;

    // Add template to collection
    const [collectionItem] = await db
      .insert(templateCollectionItems)
      .values({
        collectionId: id,
        templateId: validatedData.templateId,
        templateType: validatedData.templateType,
        order: newOrder,
        addedBy: userId,
      })
      .returning();

    // Update collection template count
    await db
      .update(templateCollections)
      .set({
        templateCount: sql`${templateCollections.templateCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(templateCollections.id, id));

    res.status(201).json(collectionItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Error adding template to collection:", error);
    res.status(500).json({ message: "Failed to add template to collection" });
  }
});

// Remove template from collection
router.delete("/:id/templates/:templateId", async (req: any, res) => {
  try {
    const { id, templateId } = req.params;
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check ownership
    const [collection] = await db
      .select()
      .from(templateCollections)
      .where(eq(templateCollections.id, id));

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.createdBy !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Remove template from collection
    const deleted = await db
      .delete(templateCollectionItems)
      .where(
        and(
          eq(templateCollectionItems.collectionId, id),
          eq(templateCollectionItems.templateId, templateId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ message: "Template not found in collection" });
    }

    // Update collection template count
    await db
      .update(templateCollections)
      .set({
        templateCount: sql`${templateCollections.templateCount} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(templateCollections.id, id));

    res.json({ message: "Template removed from collection" });
  } catch (error) {
    console.error("Error removing template from collection:", error);
    res.status(500).json({ message: "Failed to remove template from collection" });
  }
});

// Like/unlike collection
router.post("/:id/like", async (req: any, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if already liked
    const [existing] = await db
      .select()
      .from(templateCollectionLikes)
      .where(
        and(
          eq(templateCollectionLikes.collectionId, id),
          eq(templateCollectionLikes.userId, userId)
        )
      );

    if (existing) {
      // Unlike
      await db
        .delete(templateCollectionLikes)
        .where(eq(templateCollectionLikes.id, existing.id));

      res.json({ liked: false, message: "Collection unliked" });
    } else {
      // Like
      await db
        .insert(templateCollectionLikes)
        .values({
          collectionId: id,
          userId,
        });

      res.json({ liked: true, message: "Collection liked" });
    }
  } catch (error) {
    console.error("Error toggling collection like:", error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
});

// Get collection by share slug
router.get("/shared/:shareSlug", async (req: any, res) => {
  try {
    const { shareSlug } = req.params;

    // Get collection details
    const [collection] = await db
      .select({
        id: templateCollections.id,
        name: templateCollections.name,
        description: templateCollections.description,
        isPublic: templateCollections.isPublic,
        shareSlug: templateCollections.shareSlug,
        templateCount: templateCollections.templateCount,
        viewCount: templateCollections.viewCount,
        tags: templateCollections.tags,
        createdAt: templateCollections.createdAt,
        updatedAt: templateCollections.updatedAt,
        creator: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(templateCollections)
      .leftJoin(users, eq(templateCollections.createdBy, users.id))
      .where(eq(templateCollections.shareSlug, shareSlug));

    if (!collection || !collection.isPublic) {
      return res.status(404).json({ message: "Collection not found" });
    }

    // Get collection templates
    const templates = await db
      .select({
        id: templateCollectionItems.id,
        templateId: templateCollectionItems.templateId,
        templateType: templateCollectionItems.templateType,
        order: templateCollectionItems.order,
        addedAt: templateCollectionItems.createdAt,
      })
      .from(templateCollectionItems)
      .where(eq(templateCollectionItems.collectionId, collection.id))
      .orderBy(templateCollectionItems.order);

    // Increment view count
    await db
      .update(templateCollections)
      .set({ 
        viewCount: sql`${templateCollections.viewCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(templateCollections.id, collection.id));

    res.json({
      ...collection,
      templates
    });
  } catch (error) {
    console.error("Error fetching shared collection:", error);
    res.status(500).json({ message: "Failed to fetch collection" });
  }
});

export { router as templateCollectionsRoutes };