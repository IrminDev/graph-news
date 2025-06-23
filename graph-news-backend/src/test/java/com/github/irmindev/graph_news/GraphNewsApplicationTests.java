package com.github.irmindev.graph_news;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(properties = {
    "spring.data.neo4j.repositories.enabled=false",
    "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.neo4j.Neo4jAutoConfiguration,org.springframework.boot.autoconfigure.data.neo4j.Neo4jDataAutoConfiguration",
    "nlp.stanford.enabled=false",
    "spring.main.lazy-initialization=true",
    "spring.jpa.defer-datasource-initialization=true"
})
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "jwt.secret=dGVzdC1zZWNyZXQtZm9yLWp3dC10b2tlbi10aGF0LWlzLWxvbmctZW5vdWdo",
    "jwt.expiration=3600000"
})
class GraphNewsApplicationTest {

    @Test
    void contextLoads() {
        // This test verifies that the Spring application context loads successfully
        // with Neo4j and NLP disabled for testing
    }
}