import { Link } from "wouter";
import { useGetFeaturedProducts } from "@workspace/api-client-react";
import { AgeGate } from "@/components/AgeGate";
import { Shield, ChevronRight, Crosshair, Cpu } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: featured, isLoading } = useGetFeaturedProducts();

  return (
    <div className="space-y-24 pb-24">
      <AgeGate />
      
      {/* Hero */}
      <section className="relative pt-20 pb-32 flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full w-[600px] h-[600px] mx-auto top-1/2 -translate-y-1/2 pointer-events-none" />
        
        <Badge variant="outline" className="mb-6 font-mono text-primary border-primary/30 uppercase tracking-widest backdrop-blur-md">
          <Shield className="w-3 h-3 mr-2" /> Military-Grade Compliance
        </Badge>
        
        <h1 className="text-5xl md:text-7xl font-mono font-bold tracking-widest uppercase mb-6 drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Precision</span> <br />
          Commerce
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-sans font-light">
          ArmorX provides an elite, legally licensed platform for firearms dealers, collectors, and verified operators.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/products">
            <Button size="lg" className="font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-[0_0_20px_rgba(0,212,255,0.2)]">
              <Crosshair className="mr-2 w-4 h-4" /> Enter Arsenal
            </Button>
          </Link>
          <Link href="/kyc">
            <Button size="lg" variant="outline" className="font-mono uppercase tracking-wider border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/10">
              <Shield className="mr-2 w-4 h-4" /> Verify Clearance
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-mono font-bold uppercase tracking-widest border-b border-primary/30 pb-2">Classified Assets</h2>
          <Link href="/products" className="text-primary hover:text-primary/80 font-mono text-sm uppercase flex items-center">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-card border border-border rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(featured as any[])?.slice(0, 3).map((product: any) => (
              <Card key={product.id} className="bg-card/50 backdrop-blur-md border-primary/20 hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="font-mono text-[10px] text-accent border-accent/30">{product.brand}</Badge>
                    {product.requiresLicense && (
                      <Badge variant="destructive" className="font-mono text-[10px] uppercase shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                        License Req
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="font-mono text-xl mt-2 tracking-wide uppercase">{product.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{product.type} {product.caliber ? `// ${product.caliber}` : ''}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex items-center justify-center border border-dashed border-primary/20 bg-black/40 mb-4 group-hover:border-primary/40 transition-colors">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="max-h-full object-contain" />
                    ) : (
                      <Cpu className="w-12 h-12 text-primary/30" />
                    )}
                  </div>
                  <div className="font-mono text-2xl text-primary font-bold">
                    ${Number(product.price).toFixed(2)}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/products/${product.id}`} className="w-full">
                    <Button className="w-full font-mono uppercase tracking-wider bg-transparent border border-primary/50 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      Inspect Object
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
