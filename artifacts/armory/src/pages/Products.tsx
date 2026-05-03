import { useState } from "react";
import { Link } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Filter, Search, Crosshair, Cpu } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Products() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [inStock, setInStock] = useState(false);

  const { data: productsData, isLoading } = useListProducts({
    search: search || undefined,
    type: type !== "all" && type ? type : undefined,
    inStock: inStock ? true : undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-mono font-bold uppercase tracking-widest text-primary drop-shadow-[0_0_10px_rgba(0,212,255,0.3)]">Arsenal Catalog</h1>
          <p className="text-muted-foreground font-mono text-sm tracking-wider uppercase mt-1">Authorized inventory</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-md border border-primary/20 p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search designation..." 
            className="pl-9 bg-background/50 border-primary/30 font-mono text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full md:w-48 bg-background/50 border-primary/30 font-mono text-sm uppercase">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="firearm">Firearms</SelectItem>
            <SelectItem value="ammunition">Ammunition</SelectItem>
            <SelectItem value="accessory">Accessories</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2 border border-primary/30 p-2 px-4 rounded bg-background/50 ml-auto">
          <Switch id="in-stock" checked={inStock} onCheckedChange={setInStock} />
          <label htmlFor="in-stock" className="text-sm font-mono uppercase tracking-wider text-muted-foreground">In Stock Only</label>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-80 bg-card border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : productsData?.items.length === 0 ? (
        <div className="text-center py-20 bg-card/30 border border-primary/10 backdrop-blur-sm">
          <Crosshair className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="font-mono text-xl uppercase tracking-widest text-muted-foreground">No Assets Found</h3>
          <p className="text-sm text-muted-foreground/60 mt-2 font-mono uppercase">Adjust filter parameters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productsData?.items.map(product => (
            <Card key={product.id} className="bg-card/50 backdrop-blur-md border-primary/20 hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="font-mono text-[10px] text-accent border-accent/30 bg-accent/5">{product.brand}</Badge>
                  {product.requiresLicense && (
                    <Badge variant="destructive" className="font-mono text-[10px] uppercase shadow-[0_0_10px_rgba(255,0,0,0.5)]">
                      <Shield className="w-3 h-3 mr-1" /> Lic Req
                    </Badge>
                  )}
                </div>
                <CardTitle className="font-mono text-lg tracking-wide uppercase line-clamp-1" title={product.name}>{product.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground font-mono uppercase">
                  {product.type} {product.caliber ? `// ${product.caliber}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="h-32 flex items-center justify-center border border-dashed border-primary/20 bg-black/40 mb-4 group-hover:border-primary/40 transition-colors">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="max-h-full object-contain p-2" />
                  ) : (
                    <Cpu className="w-10 h-10 text-primary/30" />
                  )}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="font-mono text-xl text-primary font-bold">
                    ${Number(product.price).toFixed(2)}
                  </div>
                  <div className={`font-mono text-[10px] uppercase ${product.stockCount > 0 ? 'text-green-500' : 'text-destructive'}`}>
                    {product.stockCount > 0 ? `${product.stockCount} Units` : 'Depleted'}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href={`/products/${product.id}`} className="w-full">
                  <Button className="w-full font-mono uppercase tracking-wider bg-transparent border border-primary/50 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Inspect
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
