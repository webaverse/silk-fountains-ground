import * as THREE from 'three';
import SilkShader from './shaders/SilkShader.js';
import metaversefile from 'metaversefile';
import { Vector3 } from 'three';

const {useApp, useFrame, useLoaders, usePhysics, useCleanup, useLocalPlayer} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\/]*$/, '$1'); 


export default () => {  

    
    const app = useApp();
    const physics = usePhysics();
    const localPlayer = useLocalPlayer();
    const physicsIds = [];
    const silkNodesArray = [];
    const groundVerticePositions = [];

    let groundMeshSqrt;
    let neighbourCheckSphere;
    let silkBrightnessVal = 0;

    const rocksArray = [];
    const rockGroupsArray = [];
    const plantsArray = [];
    const bushesArray = [];

    let groundMesh;
    let rock01Mesh, rock02Mesh, rock03Mesh, rock04Mesh, rock05Mesh, rock06Mesh, rock07Mesh, rock08Mesh, rock09Mesh, rock10Mesh; 
    let rockGroup01Mesh, rockGroup02Mesh, rockGroup03Mesh, rockGroup04Mesh, rockGroup05Mesh, rockGroup06Mesh, rockGroup07Mesh, rockGroup08Mesh, rockGroup09Mesh, rockGroup10Mesh; 
    let plantMesh01, plantMesh02, plantMesh03;
    let bushMesh01, bushMesh02;
    let groundGeometry;

    const textureMap = new THREE.TextureLoader().load( baseUrl + "textures/ground/texture-map.jpg" );
    textureMap.encoding = THREE.sRGBEncoding;
    textureMap.wrapS = THREE.ClampToEdgeWrapping;
    textureMap.wrapT = THREE.ClampToEdgeWrapping;
    textureMap.anisotropy = 16;

    let heightMap;

    const silkMaterialTexture = new THREE.TextureLoader().load( baseUrl + "textures/silk/silk-contrast-noise.png" );
    silkMaterialTexture.wrapS = silkMaterialTexture.wrapT = THREE.RepeatWrapping;

    const silkShaderMaterial = new THREE.ShaderMaterial({
        uniforms: SilkShader.uniforms,
        vertexShader: SilkShader.vertexShader,
        fragmentShader: SilkShader.fragmentShader,
        side: THREE.DoubleSide,
    })

    silkShaderMaterial.uniforms.noiseImage.value = silkMaterialTexture;
    
    const getSilkMaterialClone = () => {
        let silkMaterialClone = silkShaderMaterial.clone();
        silkMaterialClone.uniforms.noiseImage.value = silkMaterialTexture;

        let seed = Math.random() * 0;
        silkMaterialClone.seed = seed;
    
        return silkMaterialClone;
    }

    const loadTextures = () => {
        return new Promise( ( resolve, reject ) => {

            const loader = new THREE.TextureLoader();
            
            loader.load(

                baseUrl + "textures/ground/height-map.jpg",

                function ( texture ) {
                    resolve( texture );
                }
            );
        });
    }


    const loadModel = ( params ) => {

        return new Promise( ( resolve, reject ) => {
                
            const { gltfLoader } = useLoaders();
            const { dracoLoader } = useLoaders();
            gltfLoader.setDRACOLoader( dracoLoader );
    
            gltfLoader.load( params.filePath + params.fileName, function( gltf ) {
    
                let numVerts = 0;
    
                gltf.scene.traverse( function ( child ) {

                    if ( child.isMesh ) {
                        
                        if( params.fileName == "SilkFountain_Ground_V4_Dream.glb" ){

                            let mat = new THREE.MeshStandardMaterial( { 
                               color: 0xffffff,
                                map: textureMap,
                                /* displacementMap: heightMap,
                                displacementScale: 800,  */
                                wireframe: false
                            })

                            mat.needsUpdate = true
                                
                            child.material = mat;

                            const physicsId = physics.addGeometry( child );
                            physicsIds.push( physicsId );

                            groundGeometry = child.geometry;

                            for( let i = 0; i< groundGeometry.attributes.position.count; i++ ){
                                groundGeometry.attributes.position.needsUpdate = true;
                                let v = new THREE.Vector3().fromBufferAttribute( groundGeometry.attributes.position, i ) ;
                                groundVerticePositions.push( v );
                            }

                        }


                        numVerts += child.geometry.index.count / 3;  

                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
    
                //console.log( `Silk Fountain Ground modelLoaded() -> ${ params.fileName } num verts: ` + numVerts );
    
                gltf.scene.position.set( params.pos.x, params.pos.y, params.pos.z );

                resolve( gltf.scene );     
            });
        })
    }

    loadTextures().then( result => {
        heightMap = result;
        heightMap.encoding = THREE.sRGBEncoding;
        heightMap.wrapS = THREE.ClampToEdgeWrapping;
        heightMap.wrapT = THREE.ClampToEdgeWrapping;
        heightMap.anisotropy = 16;

        beginModelsLoad();
    })

    const beginModelsLoad = () => {

        let p1 = loadModel( { filePath: baseUrl, fileName: 'SilkFountain_Ground_V4_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { groundMesh = result } );

        let p2 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/Rock01_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rock01Mesh = result.children[ 0 ] } );
        let p3 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/Rock02_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rock02Mesh = result.children[ 0 ] } );
        let p4 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/Rock03_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rock03Mesh = result.children[ 0 ] } );
        let p5 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/Rock04_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rock04Mesh = result.children[ 0 ] } );
        let p6 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/Rock05_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rock05Mesh = result.children[ 0 ] } );
        let p7 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/Rock06_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rock06Mesh = result.children[ 0 ] } );
        let p8 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/Rock07_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rock07Mesh = result.children[ 0 ] } );
        let p9 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/Rock08_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rock08Mesh = result.children[ 0 ] } );
        let p10 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/Rock09_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rock09Mesh = result.children[ 0 ] } );
        let p11 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/Rock10_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rock10Mesh = result.children[ 0 ] } );
    
        let p12 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/RockGroup01_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rockGroup01Mesh = result.children[ 0 ] } );
        let p13 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/RockGroup02_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rockGroup02Mesh = result.children[ 0 ] } );
        let p14 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/RockGroup03_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rockGroup03Mesh = result.children[ 0 ] } );
        let p15 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/RockGroup04_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rockGroup04Mesh = result.children[ 0 ] } );
        let p16 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/RockGroup05_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rockGroup05Mesh = result.children[ 0 ] } );
        let p17 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/RockGroup06_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rockGroup06Mesh = result.children[ 0 ] } );
        let p18 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/RockGroup07_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rockGroup07Mesh = result.children[ 0 ] } );
        let p19 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/RockGroup08_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rockGroup08Mesh = result.children[ 0 ] } );
        let p20 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/RockGroup09_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rockGroup09Mesh = result.children[ 0 ] } );
        let p21 = loadModel( { filePath: baseUrl, fileName: 'models/rocks/RockGroup10_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { rockGroup10Mesh = result.children[ 0 ] } );
    
        let p22 = loadModel( { filePath: baseUrl, fileName: 'models/plants/Plant01_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { plantMesh01 = result.children[ 0 ] } );
        let p23 = loadModel( { filePath: baseUrl, fileName: 'models/plants/Plant02_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { plantMesh02 = result.children[ 0 ] } );
        let p24 = loadModel( { filePath: baseUrl, fileName: 'models/plants/Plant03_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { plantMesh03 = result.children[ 0 ] } );
    
        let p25 = loadModel( { filePath: baseUrl, fileName: 'models/bushes/Bush01_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { bushMesh01 = result.children[ 0 ] } );
        let p26 = loadModel( { filePath: baseUrl, fileName: 'models/bushes/Bush01_Dream.glb', pos: { x: 0, y: 0, z: 0 } } ).then( result => { bushMesh02 = result.children[ 0 ] } );
    
        let loadPromisesArr = [ p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24, p25, p26 ];
    
        Promise.all( loadPromisesArr ).then( models => {
    
            app.add( groundMesh );
    
            rocksArray.push( rock01Mesh, rock02Mesh, rock03Mesh, rock04Mesh, rock05Mesh, rock06Mesh, rock07Mesh, rock08Mesh, rock09Mesh, rock10Mesh );
            rockGroupsArray.push( rockGroup01Mesh, rockGroup02Mesh, rockGroup03Mesh, rockGroup04Mesh, rockGroup05Mesh, rockGroup06Mesh, rockGroup07Mesh, rockGroup08Mesh, rockGroup09Mesh, rockGroup10Mesh );
            plantsArray.push( plantMesh01, plantMesh02, plantMesh03 );
            bushesArray.push( bushMesh01, bushMesh02 );

            addGroundItems();
            addAndScatterSilkNodes( 500, 1, 2 );
        });
    }

    
    

    const addGroundItems = () => {

        
                          // mesh, amount, minScale, maxScale, hasPhysics 
        createInstancedMesh( rock01Mesh, 100, 0.8, 2, false );
        createInstancedMesh( rock03Mesh, 10, 0.8, 20, false );
        createInstancedMesh( rock02Mesh, 100, 0.8, 2, false );
        createInstancedMesh( rock04Mesh, 100, 0.8, 2, false );
        createInstancedMesh( rock05Mesh, 100, 0.8, 2, false );
        createInstancedMesh( rock06Mesh, 100, 0.8, 20, false );
        createInstancedMesh( rock07Mesh, 100, 0.8, 2, false );
        createInstancedMesh( rock08Mesh, 10, 0.8, 2, false );
        createInstancedMesh( rock09Mesh, 100, 0.8, 2, false );
        createInstancedMesh( rock10Mesh, 10, 0.8, 20, false );

        createInstancedMesh( rockGroup01Mesh, 200, 0.8, 2, false );
        createInstancedMesh( rockGroup02Mesh, 200, 0.8, 2, false );
        createInstancedMesh( rockGroup03Mesh, 200, 0.8, 2, false );
        createInstancedMesh( rockGroup04Mesh, 200, 0.8, 2, false );
        createInstancedMesh( rockGroup05Mesh, 200, 0.8, 2, false );
        createInstancedMesh( rockGroup06Mesh, 200, 0.8, 2, false );
        createInstancedMesh( rockGroup07Mesh, 200, 0.8, 2, false );
        createInstancedMesh( rockGroup08Mesh, 200, 0.8, 2, false );
        createInstancedMesh( rockGroup09Mesh, 200, 0.8, 2, false );
        createInstancedMesh( rockGroup10Mesh, 200, 0.8, 2, false );

        createInstancedMesh( plantMesh01, 100, 0.8, 2, false );
        createInstancedMesh( plantMesh02, 100, 0.8, 3, false );
        createInstancedMesh( plantMesh03, 100, 0.8, 2, false );

        createInstancedMesh( bushMesh01, 100, 0.8, 4, false );
        createInstancedMesh( bushMesh02, 100, 0.8, 2, false );


    }

    const addDebugGround = () => {

        console.log( 'ADD DEBUG GROUND ')
        let g = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000, 64, 64 ), new THREE.MeshStandardMaterial( { 
            side: THREE.DoubleSide,
            color: 0x556f30,
            //map: new THREE.TextureLoader().load( './textures/grass/grass.jp')
        }) );
        g.setRotationFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), -Math.PI/2 );
        app.add( g )
        g.updateMatrixWorld();
    }

    const randomizeMatrix = function () {

        const rotation = new THREE.Euler();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        neighbourCheckSphere = new THREE.Sphere( new Vector3( 0,0,0 ), 5 );

        return function ( matrix, minScale, maxScale ) {

            let p = groundVerticePositions[ Math.floor( Math.random() * groundVerticePositions.length )];

            neighbourCheckSphere.set( p, 10 );
            let neighbours = [];
            
            for( let i = 0; i<groundVerticePositions.length; i++ ){
                if( neighbourCheckSphere.containsPoint( groundVerticePositions[ i ] ) ){
                    neighbours.push( groundVerticePositions[ i ] );
                }
            }

            let randNeighbourVec = neighbours[ Math.floor( Math.random() * neighbours.length )];
            let lerpPos = p.lerp( randNeighbourVec, Math.random() );

            rotation.y = Math.random() * 2 * Math.PI;

            quaternion.setFromEuler( rotation );

            scale.x = scale.y = scale.z = minScale + Math.floor( Math.random() * ( maxScale - minScale ) );

            matrix.compose( lerpPos, quaternion, scale );

        };

    }();

    const createInstancedMesh = ( mesh, amount, minScale, maxScale, hasPhysics ) => {

        const matrix = new THREE.Matrix4();
        const m = new THREE.InstancedMesh( mesh.geometry, mesh.material, amount );

        for ( let i = 0; i < amount; i ++ ) {
            randomizeMatrix( matrix, minScale, maxScale );
            m.setMatrixAt( i, matrix );
        }

        if( hasPhysics ) {
            const physicsId = physics.addGeometry( m ); 
            physicsIds.push( physicsId );
        }

        app.add( m );
        m.updateMatrixWorld()
        
    }

    const addAndScatterSilkNodes = ( amount, minScale, maxScale ) => {

        const scale = new THREE.Vector3();
        const rotation = new THREE.Euler();
        const quaternion = new THREE.Quaternion();

        for( let i = 0; i<amount; i++ ){
            let randRockMesh = rocksArray[ Math.floor( Math.random() * rocksArray.length ) ].clone();

            let p = new THREE.Vector3( 15, 0, 0);

            neighbourCheckSphere.set( p, 100 );
            let neighbours = [];
            
            for( let j = 0; j<groundVerticePositions.length; j++ ){
                if( neighbourCheckSphere.containsPoint( groundVerticePositions[ j ] ) ){
                    neighbours.push( groundVerticePositions[ j ] );
                }
            }

            let randStartVec = neighbours[ Math.floor( Math.random() * neighbours.length )];
        
            neighbourCheckSphere.set( randStartVec, 10 );

            let immediateNeighbours = [];

            for( let k = 0; k<groundVerticePositions.length; k++ ){
                if( neighbourCheckSphere.containsPoint( groundVerticePositions[ k ] ) ){
                    immediateNeighbours.push( groundVerticePositions[ k ] );
                }
            }

            let randNeighbourVec = immediateNeighbours[ Math.floor( Math.random() * immediateNeighbours.length )];
            
            let lerpPos = randStartVec.lerp( randNeighbourVec, Math.random() );

            randRockMesh.rotation.y = Math.random() * 2 * Math.PI;

            let distanceScale = ( 100 - lerpPos.distanceTo( p ) ) * 0.02;

            randRockMesh.scale.x = randRockMesh.scale.y = randRockMesh.scale.z = ( minScale + Math.floor( Math.random() * ( maxScale - minScale ) ) ) * distanceScale;
            randRockMesh.position.set( lerpPos.x, lerpPos.y, lerpPos.z );
            randRockMesh.dist = distanceScale;
            randRockMesh.material = getSilkMaterialClone();
            silkNodesArray.push( randRockMesh );

            app.add( randRockMesh );
            randRockMesh.updateMatrixWorld();
    
        }
    }


    useFrame(( { timestamp } ) => {

        silkBrightnessVal += 0.1;

        for( let i = 0; i < silkNodesArray.length; i++ ){
            let shaderMesh = silkNodesArray[ i ];
            shaderMesh.material.seed += 0.005;
            shaderMesh.material.uniforms.time.value = shaderMesh.material.seed;
            shaderMesh.material.uniforms.tileCaustic_brightness.value = 1.5 - ( ( ( 1 + Math.sin( shaderMesh.dist + silkBrightnessVal ) ) * 0.5 ) );
            shaderMesh.material.uniforms.noiseRipples_brightness.value = 0.1 - ( ( ( 1 + Math.sin( shaderMesh.dist + silkBrightnessVal ) ) * 0.5 ) * 0.075 );
        }

        //console.log( 'playerPos ', localPlayer.position );
    });

    useCleanup(() => {
      for (const physicsId of physicsIds) {
       physics.removeGeometry(physicsId);
      }
    });

    return app;
}