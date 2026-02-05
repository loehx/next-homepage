# iPhone 3D Model Setup

## Required: Download iPhone Model

The 3D iPhone model is not included in the repository. You need to download it manually:

### Step 1: Download from Sketchfab
1. Go to: https://sketchfab.com/3d-models/iphone-15-pro-max-5b7b35513a154ac69619dc2b2fe15686
2. Click "Download 3D Model" button
3. Select "glTF" format (auto-download)
4. Extract the downloaded zip file

### Step 2: Install Model
1. Find the `scene.gltf` or `scene.glb` file in the extracted folder
2. Rename it to `iphone.glb`
3. Place it in: `/public/models/iphone.glb`

### Alternative Models
If the above model doesn't work, try these alternatives:
- https://sketchfab.com/3d-models/iphone-15-pro-9e045e469d514fea9dda2ccd161f5fa3
- https://sketchfab.com/3d-models/iphone-15-d3262d62f4d34bd4903d49f8841b42ac

## Model Requirements
- Format: GLB or GLTF
- Screen object must be named "screen" (or update code to match)
- Size: < 2MB recommended
- Triangles: < 10k recommended

## Testing
Once the model is in place, start the dev server:
```bash
npm run start
```

Navigate to `http://localhost:8080/?pos=0.5` to test the phone entrance animation.
