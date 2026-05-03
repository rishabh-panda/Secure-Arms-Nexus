import { useListProducts } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminProducts() {
  // Simplification: Read-only view for the sake of completeness in this iteration
  // Full CRUD would require dedicated forms
  const { data: productsData, isLoading } = useListProducts({ limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-mono font-bold uppercase tracking-widest text-primary">Inventory Control</h2>
        <Button className="font-mono uppercase tracking-wider bg-primary/20 text-primary border border-primary/50 hover:bg-primary shadow-[0_0_10px_rgba(0,212,255,0.2)]">
          <Plus className="w-4 h-4 mr-2" /> New Asset
        </Button>
      </div>

      <Card className="bg-card/40 backdrop-blur-sm border-primary/20 rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow className="border-primary/20 hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase text-primary">Designation</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">Type / Caliber</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary">Stock</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary text-right">Value</TableHead>
              <TableHead className="font-mono text-xs uppercase text-primary text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={5} className="text-center font-mono text-sm py-8 text-primary animate-pulse">Loading inventory...</TableCell></TableRow>
            ) : productsData?.items.map(product => (
                <TableRow key={product.id} className="border-primary/10 hover:bg-primary/5">
                  <TableCell>
                    <div className="font-mono text-sm uppercase text-foreground">{product.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase">{product.brand}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs uppercase">{product.type}</div>
                    {product.caliber && <div className="font-mono text-[10px] text-muted-foreground">{product.caliber}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase bg-transparent ${product.stockCount > 0 ? 'border-primary/30 text-primary' : 'border-destructive/30 text-destructive'}`}>
                      {product.stockCount} Units
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-primary font-bold">${Number(product.price).toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit2 className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
