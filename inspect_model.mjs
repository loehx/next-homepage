import { NodeIO } from '@gltf-transform/core';
import { KHRDracoMeshCompression } from '@gltf-transform/extensions';
import draco3d from 'draco3d';

async function main() {
  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])
    .registerDependencies({
      'draco3d.decoder': await draco3d.createDecoderModule(),
    });

  const document = await io.read('public/models/iphone_only.glb');
  const root = document.getRoot();
  const meshes = root.listMeshes();

  console.log('Meshes in model:');
  meshes.forEach((mesh, index) => {
    const primitives = mesh.listPrimitives();
    const materialName = primitives[0]?.getMaterial()?.getName() || 'No material';
    
    // Get attribute information
    const position = primitives[0]?.getAttribute('POSITION');
    let count = 0;
    if (position) {
      count = position.getCount();
    }
    
    console.log(`Index: ${index}, Name: "${mesh.getName()}", Material: "${materialName}", Vertices: ${count}`);
  });
}

main().catch(console.error);
