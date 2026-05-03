import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct, getGetProductQueryKey, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Crosshair, ArrowLeft, AlertTriangle, Plus, Terminal } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Grid, Center, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from 'three';

// 3D Weapon-like abstract object
function GeometricWeapon() {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main body / barrel representation */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 0.5, 0.5]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Grip / Handle */}
      <mesh position={[-1, -0.6, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.4, 1.2, 0.4]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.5} />
      </mesh>
      
      {/* Magazine */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.6, 1, 0.35]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Scope / Optic */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cyber accents / glowing bits */}
      <mesh position={[1.4, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="#00D4FF" />
      </mesh>
      <mesh position={[-1.4, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="#00D4FF" />
      </mesh>
    </group>
  );
}

function SpecLabel({ position, title, value }: { position: [number, number, number], title: string, value: string }) {
  return (
    <Html position={position} center className="pointer-events-none">
      <div className="bg-background/80 backdrop-blur-md border border-primary/50 p-2 flex flex-col min-w-[120px] shadow-[0_0_15px_rgba(0,212,255,0.2)]">
        <span className="text-[9px] text-primary/70 font-mono uppercase tracking-widest mb-1">{title}</span>
        <span className="text-xs text-foreground font-mono uppercase tracking-wider">{value}</span>
      </div>
    </Html>
  );
}

export default function ProductDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id } });
  const addToCartMutation = useAddToCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAddToCart = () => {
    addToCartMutation.mutate({ data: { productId: id, quantity: 1 } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({ title: "Asset Secured", description: "Added to cart." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.error || "Failed to add to cart", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return <div className="h-[80vh] flex items-center justify-center font-mono text-primary animate-pulse">Loading Asset Data...</div>;
  }

  if (!product) return <div>Product not found</div>;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6">
      <Link href="/products" className="absolute top-4 left-4 z-10 text-primary hover:text-primary/80 font-mono text-xs uppercase flex items-center bg-background/50 p-2 backdrop-blur-md border border-primary/20">
        <ArrowLeft className="w-4 h-4 mr-2" /> Return to Catalog
      </Link>

      {/* Left: 3D Viewer */}
      <div className="lg:w-2/3 h-[50vh] lg:h-full bg-black/80 rounded border border-primary/20 relative overflow-hidden">
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
          <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30 bg-background/50 backdrop-blur-md">
            <Terminal className="w-3 h-3 mr-2" /> Interactive 3D Model
          </Badge>
          {product.requiresLicense && (
            <Badge variant="destructive" className="font-mono text-xs uppercase shadow-[0_0_10px_rgba(255,0,0,0.5)] animate-pulse">
              <ShieldAlert className="w-3 h-3 mr-2" /> Class 3 License Required
            </Badge>
          )}
        </div>
        
        <Canvas camera={{ position: [4, 2, 5], fov: 45 }}>
          <color attach="background" args={['#080b11']} />
          <fog attach="fog" args={['#080b11', 5, 20]} />
          
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00D4FF" />
          <pointLight position={[10, -10, 10]} intensity={0.5} color="#8B5CF6" />

          <Center>
            <GeometricWeapon />
            
            {product.specs && product.specs[0] && (
              <SpecLabel position={[0, 1.5, 0]} title={product.specs[0].label} value={product.specs[0].value} />
            )}
            {product.specs && product.specs[1] && (
              <SpecLabel position={[2, -1, 0]} title={product.specs[1].label} value={product.specs[1].value} />
            )}
            <SpecLabel position={[-2.5, 0.5, 0]} title="CALIBER" value={product.caliber || 'N/A'} />
          </Center>

          <Grid
            renderOrder={-1}
            position={[0, -1.5, 0]}
            infiniteGrid
            cellSize={0.4}
            cellThickness={0.5}
            sectionSize={2}
            sectionThickness={1}
            sectionColor={[0, 0.8, 1]}
            cellColor={[0.1, 0.2, 0.3]}
            fadeDistance={20}
            fadeStrength={1}
          />
          <ContactShadows position={[0, -1.49, 0]} opacity={0.5} scale={10} blur={2} far={4} />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2 - 0.05} autoRotate autoRotateSpeed={0.5} />
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Right: Specs Panel */}
      <div className="lg:w-1/3 flex flex-col bg-card/60 backdrop-blur-xl border border-primary/30 h-full overflow-y-auto custom-scrollbar p-6">
        <div className="mb-6">
          <div className="text-accent font-mono text-xs tracking-widest uppercase mb-2 flex items-center">
            {product.brand} <span className="mx-2 text-muted-foreground">///</span> {product.categoryName}
          </div>
          <h1 className="text-3xl font-mono font-bold uppercase tracking-wider text-foreground mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            {product.name}
          </h1>
          <div className="text-4xl font-mono text-primary font-bold mb-6">
            ${Number(product.price).toFixed(2)}
          </div>
          
          <Button 
            className="w-full h-14 text-lg font-mono uppercase tracking-widest bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_20px_rgba(0,212,255,0.2)]"
            disabled={product.stockCount === 0 || addToCartMutation.isPending}
            onClick={handleAddToCart}
          >
            {addToCartMutation.isPending ? (
              "Processing..."
            ) : product.stockCount === 0 ? (
              "Depleted"
            ) : (
              <><Plus className="mr-2 w-5 h-5" /> Requisition Asset</>
            )}
          </Button>
        </div>

        <div className="space-y-8 flex-1">
          <section>
            <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground border-b border-primary/20 pb-2 mb-4 flex items-center">
              <Crosshair className="w-4 h-4 mr-2" /> Asset Specs
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/40 p-3 border border-primary/10">
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Type</div>
                <div className="font-mono text-sm uppercase text-foreground">{product.type}</div>
              </div>
              <div className="bg-background/40 p-3 border border-primary/10">
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Caliber</div>
                <div className="font-mono text-sm uppercase text-foreground">{product.caliber || 'N/A'}</div>
              </div>
              {product.specs?.map((spec, i) => (
                <div key={i} className="bg-background/40 p-3 border border-primary/10">
                  <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mb-1">{spec.label}</div>
                  <div className="font-mono text-sm uppercase text-foreground">{spec.value} {spec.unit}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-mono text-sm uppercase tracking-widest text-muted-foreground border-b border-primary/20 pb-2 mb-4">
              Description
            </h3>
            <p className="text-sm text-foreground/80 font-sans leading-relaxed">
              {product.description}
            </p>
          </section>

          <section>
            <h3 className="font-mono text-sm uppercase tracking-widest text-destructive border-b border-destructive/30 pb-2 mb-4 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" /> Compliance Data
            </h3>
            <div className="bg-destructive/5 border border-destructive/20 p-4 space-y-3">
              <div>
                <div className="text-xs text-destructive font-mono uppercase mb-1">Legal Requirements</div>
                <div className="text-sm text-foreground/80 font-sans">{product.legalRequirements || "Standard age verification."}</div>
              </div>
              <div>
                <div className="text-xs text-destructive font-mono uppercase mb-1">Safety Protocol</div>
                <div className="text-sm text-foreground/80 font-sans">{product.safetyInfo || "Follow standard handling procedures."}</div>
              </div>
              {product.restrictedJurisdictions && product.restrictedJurisdictions.length > 0 && (
                <div>
                  <div className="text-xs text-destructive font-mono uppercase mb-1">Restricted Zones</div>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {product.restrictedJurisdictions.map(j => (
                      <Badge key={j} variant="outline" className="border-destructive/30 text-destructive text-[10px] font-mono">{j}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
