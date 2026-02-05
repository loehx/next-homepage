import { createClient } from 'contentful';

export interface ContentfulConfig {
  space: string;
  accessToken: string;
  environment?: string;
}

export function getContentfulClient(config: ContentfulConfig) {
  return createClient({
    space: config.space,
    accessToken: config.accessToken,
    environment: config.environment || 'master',
  });
}

// Example: Fetch image from Contentful
export async function getContentfulImage(assetId: string, config: ContentfulConfig) {
  const client = getContentfulClient(config);
  try {
    const asset = await client.getAsset(assetId);
    return {
      url: `https:${asset.fields.file?.url}`,
      title: asset.fields.title,
      description: asset.fields.description,
    };
  } catch (error) {
    console.error('Error fetching Contentful asset:', error);
    return null;
  }
}
