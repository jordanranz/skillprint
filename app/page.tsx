import { Catalog } from "@/components/catalog";
import { catalogEntries, catalogGeneratedAt } from "@/lib/catalog-data";

export default function Home() { return <Catalog ranking={catalogEntries} generatedAt={catalogGeneratedAt}/>; }
