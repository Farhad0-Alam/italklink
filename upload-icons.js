const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;

if (!bucketId) {
  console.error('Missing bucket ID');
  process.exit(1);
}

const bucketName = bucketId.split('/')[0];
const bucket = storage.bucket(bucketName);

const icons = [
  { src: 'attached_assets/Facebook_1763807209350.png', dest: 'social-icons/facebook.png' },
  { src: 'attached_assets/Github_1763807209352.png', dest: 'social-icons/github.png' },
  { src: 'attached_assets/Instagram_1763807209352.png', dest: 'social-icons/instagram.png' },
  { src: 'attached_assets/Linkedin_1763807209353.png', dest: 'social-icons/linkedin.png' },
  { src: 'attached_assets/Pinterest_1763807209354.png', dest: 'social-icons/pinterest.png' },
  { src: 'attached_assets/snapchat_1763807209354.png', dest: 'social-icons/snapchat.png' },
  { src: 'attached_assets/TikTok_1763807209355.png', dest: 'social-icons/tiktok.png' },
  { src: 'attached_assets/WhatsApp_1763807209355.png', dest: 'social-icons/whatsapp.png' },
  { src: 'attached_assets/X_1763807209356.png', dest: 'social-icons/x.png' },
  { src: 'attached_assets/YouTube_1763807209356.png', dest: 'social-icons/youtube.png' },
];

async function uploadIcons() {
  try {
    for (const icon of icons) {
      await bucket.upload(icon.src, { destination: icon.dest, public: true });
      console.log(`✓ Uploaded ${icon.dest}`);
    }
    console.log('All icons uploaded!');
    process.exit(0);
  } catch (error) {
    console.error('Upload failed:', error.message);
    process.exit(1);
  }
}

uploadIcons();
