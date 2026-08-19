import { Catalog } from "@/components/catalog";
import { catalogEntries, catalogGeneratedAt } from "@/lib/catalog-data";
import { skills } from "@/lib/skills";

export default function Home() { return <Catalog skills={skills} ranking={catalogEntries} generatedAt={catalogGeneratedAt}/>; }
