/**
 * Adapter functions to convert between editor format (strings) and schema format (numbers)
 * for Contact Section and Social Section elements
 */

import { PageElement } from "@shared/schema";

// Convert schema data (numbers) to editor format (strings)
export function schemaToEditorContact(data: PageElement & { type: "contactSection" }["data"]) {
  return {
    ...data,
    iconSize: data.iconSize?.toString() || "20",
    iconBorderSize: data.iconBorderSize?.toString() || "0",
    iconBgSize: data.iconBgSize?.toString() || "40",
    iconWidth: data.iconWidth?.toString() || "40",
    iconHeight: data.iconHeight?.toString() || "40",
    fontSize: data.fontSize?.toString() || "16",
    fontWeight: data.fontWeight?.toString() || "400",
    shadowBlur: data.shadowBlur?.toString() || "10",
    shadowOffsetX: data.shadowOffsetX?.toString() || "0",
    shadowOffsetY: data.shadowOffsetY?.toString() || "2",
    shadowOpacity: data.shadowOpacity?.toString() || "25",
    containerBorderWidth: data.containerBorderWidth?.toString() || "1",
    containerBorderRadius: data.containerBorderRadius?.toString() || "8",
    containerPadding: data.containerPadding?.toString() || "16",
    gap: data.gap?.toString() || "",
    containerShadowOpacity: data.containerShadowOpacity?.toString() || "10",
    containerShadowBlur: data.containerShadowBlur?.toString() || "10",
    containerShadowOffsetX: data.containerShadowOffsetX?.toString() || "0",
    containerShadowOffsetY: data.containerShadowOffsetY?.toString() || "4",
  };
}

// Convert editor format (strings) to schema data (numbers)
export function editorToSchemaContact(editorData: any) {
  return {
    ...editorData,
    iconSize: editorData.iconSize ? parseInt(editorData.iconSize) : 20,
    iconBorderSize: editorData.iconBorderSize ? parseInt(editorData.iconBorderSize) : 0,
    iconBgSize: editorData.iconBgSize ? parseInt(editorData.iconBgSize) : 40,
    iconWidth: editorData.iconWidth ? parseInt(editorData.iconWidth) : 40,
    iconHeight: editorData.iconHeight ? parseInt(editorData.iconHeight) : 40,
    fontSize: editorData.fontSize ? parseInt(editorData.fontSize) : 16,
    fontWeight: editorData.fontWeight ? parseInt(editorData.fontWeight) : 400,
    shadowBlur: editorData.shadowBlur ? parseInt(editorData.shadowBlur) : 10,
    shadowOffsetX: editorData.shadowOffsetX ? parseInt(editorData.shadowOffsetX) : 0,
    shadowOffsetY: editorData.shadowOffsetY ? parseInt(editorData.shadowOffsetY) : 2,
    shadowOpacity: editorData.shadowOpacity ? parseInt(editorData.shadowOpacity) : 25,
    containerBorderWidth: editorData.containerBorderWidth ? parseInt(editorData.containerBorderWidth) : 1,
    containerBorderRadius: editorData.containerBorderRadius ? parseInt(editorData.containerBorderRadius) : 8,
    containerPadding: editorData.containerPadding ? parseInt(editorData.containerPadding) : 16,
    gap: editorData.gap ? parseInt(editorData.gap) : undefined,
    containerShadowOpacity: editorData.containerShadowOpacity ? parseInt(editorData.containerShadowOpacity) : 10,
    containerShadowBlur: editorData.containerShadowBlur ? parseInt(editorData.containerShadowBlur) : 10,
    containerShadowOffsetX: editorData.containerShadowOffsetX ? parseInt(editorData.containerShadowOffsetX) : 0,
    containerShadowOffsetY: editorData.containerShadowOffsetY ? parseInt(editorData.containerShadowOffsetY) : 4,
  };
}

// Convert schema data (numbers) to editor format (strings) for social sections
export function schemaToEditorSocial(data: PageElement & { type: "socialSection" }["data"]) {
  return {
    ...data,
    iconSize: data.iconSize?.toString() || "20",
    iconBorderSize: data.iconBorderSize?.toString() || "0",
    iconBgSize: data.iconBgSize?.toString() || "40",
    iconWidth: data.iconWidth?.toString() || "40",
    iconHeight: data.iconHeight?.toString() || "40",
    fontSize: data.fontSize?.toString() || "16",
    fontWeight: data.fontWeight?.toString() || "400",
    shadowBlur: data.shadowBlur?.toString() || "10",
    shadowOffsetX: data.shadowOffsetX?.toString() || "0",
    shadowOffsetY: data.shadowOffsetY?.toString() || "2",
    shadowOpacity: data.shadowOpacity?.toString() || "25",
    containerBorderWidth: data.containerBorderWidth?.toString() || "1",
    containerBorderRadius: data.containerBorderRadius?.toString() || "8",
    containerPadding: data.containerPadding?.toString() || "16",
    gap: data.gap?.toString() || "",
    containerShadowOpacity: data.containerShadowOpacity?.toString() || "10",
    containerShadowBlur: data.containerShadowBlur?.toString() || "10",
    containerShadowOffsetX: data.containerShadowOffsetX?.toString() || "0",
    containerShadowOffsetY: data.containerShadowOffsetY?.toString() || "4",
  };
}

// Convert editor format (strings) to schema data (numbers) for social sections
export function editorToSchemaSocial(editorData: any) {
  return {
    ...editorData,
    iconSize: editorData.iconSize ? parseInt(editorData.iconSize) : 20,
    iconBorderSize: editorData.iconBorderSize ? parseInt(editorData.iconBorderSize) : 0,
    iconBgSize: editorData.iconBgSize ? parseInt(editorData.iconBgSize) : 40,
    iconWidth: editorData.iconWidth ? parseInt(editorData.iconWidth) : 40,
    iconHeight: editorData.iconHeight ? parseInt(editorData.iconHeight) : 40,
    fontSize: editorData.fontSize ? parseInt(editorData.fontSize) : 16,
    fontWeight: editorData.fontWeight ? parseInt(editorData.fontWeight) : 400,
    shadowBlur: editorData.shadowBlur ? parseInt(editorData.shadowBlur) : 10,
    shadowOffsetX: editorData.shadowOffsetX ? parseInt(editorData.shadowOffsetX) : 0,
    shadowOffsetY: editorData.shadowOffsetY ? parseInt(editorData.shadowOffsetY) : 2,
    shadowOpacity: editorData.shadowOpacity ? parseInt(editorData.shadowOpacity) : 25,
    containerBorderWidth: editorData.containerBorderWidth ? parseInt(editorData.containerBorderWidth) : 1,
    containerBorderRadius: editorData.containerBorderRadius ? parseInt(editorData.containerBorderRadius) : 8,
    containerPadding: editorData.containerPadding ? parseInt(editorData.containerPadding) : 16,
    gap: editorData.gap ? parseInt(editorData.gap) : undefined,
    containerShadowOpacity: editorData.containerShadowOpacity ? parseInt(editorData.containerShadowOpacity) : 10,
    containerShadowBlur: editorData.containerShadowBlur ? parseInt(editorData.containerShadowBlur) : 10,
    containerShadowOffsetX: editorData.containerShadowOffsetX ? parseInt(editorData.containerShadowOffsetX) : 0,
    containerShadowOffsetY: editorData.containerShadowOffsetY ? parseInt(editorData.containerShadowOffsetY) : 4,
  };
}
