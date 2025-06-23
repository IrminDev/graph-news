import NewsNode from "./NewsNode";
import EntityNode from "./EntityNode";
import EntityRelationship from "./EntityRelationship";

interface NewsGraph {
    news: NewsNode;
    entities: EntityNode[];
    relationships: EntityRelationship[];
}

export default NewsGraph;