import { NodeIO } from '@gltf-transform/core';
import { KHRDracoMeshCompression } from '@gltf-transform/extensions';
import draco3d from 'draco3d';

// Helper function to multiply quaternions (q1 * q2)
function multiplyQuaternions(q1, q2) {
  return [
    q1[3] * q2[0] + q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1], // x
    q1[3] * q2[1] - q1[0] * q2[2] + q1[1] * q2[3] + q1[2] * q2[0], // y
    q1[3] * q2[2] + q1[0] * q2[1] - q1[1] * q2[0] + q1[2] * q2[3], // z
    q1[3] * q2[3] - q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2], // w
  ];
}

// Create a quaternion for rotation around X-axis by angle (in radians)
function quaternionFromAxisAngle(axis, angle) {
  const halfAngle = angle / 2;
  const s = Math.sin(halfAngle);
  return [
    axis[0] * s, // x
    axis[1] * s, // y
    axis[2] * s, // z
    Math.cos(halfAngle), // w
  ];
}

async function main() {
  console.log('Loading GLB model...');
  
  const decoderModule = await draco3d.createDecoderModule();
  const encoderModule = await draco3d.createEncoderModule();
  
  const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])
    .registerDependencies({
      'draco3d.decoder': decoderModule,
      'draco3d.encoder': encoderModule,
    });

  const document = await io.read('public/models/iphone_only.glb');
  const root = document.getRoot();
  
  // Get all scenes
  const scenes = root.listScenes();
  console.log(`Found ${scenes.length} scene(s)`);
  
  // Create rotation quaternion for -90 degrees around X-axis
  // This rotates the model from horizontal (lying flat) to vertical (standing upright)
  const rotationX = -Math.PI / 2; // -90 degrees
  const xAxis = [1, 0, 0]; // X-axis
  const rotationQuaternion = quaternionFromAxisAngle(xAxis, rotationX);
  
  // FIXED APPROACH: Only rotate root nodes, NOT recursively
  // Rotating parent nodes automatically rotates children in the scene graph
  // Recursive rotation was causing double rotation and corruption
  scenes.forEach((scene, sceneIndex) => {
    console.log(`Processing scene ${sceneIndex}...`);
    
    // Get all root nodes in the scene
    const rootNodes = scene.listChildren();
    console.log(`  Found ${rootNodes.length} root node(s)`);
    
    rootNodes.forEach((node, nodeIndex) => {
      const nodeName = node.getName() || `node_${nodeIndex}`;
      console.log(`  Rotating root node: ${nodeName}`);
      
      // Get current rotation
      const currentRotation = node.getRotation();
      
      // Multiply rotations: apply rotationQuaternion first, then currentRotation
      // This ensures the model rotates correctly relative to its current orientation
      const newRotation = multiplyQuaternions(rotationQuaternion, currentRotation);
      
      // Set the new rotation on the root node only
      // Children will inherit this transform automatically
      node.setRotation(newRotation);
    });
  });
  
  // Save the modified model
  console.log('Saving fixed rotated model...');
  await io.write('public/models/iphone_only.glb', document);
  
  console.log('✅ Model rotation fixed! iPhone should now be upright and complete.');
}

main().catch(console.error);
