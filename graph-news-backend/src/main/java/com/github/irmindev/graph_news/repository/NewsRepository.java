package com.github.irmindev.graph_news.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.github.irmindev.graph_news.model.entity.News;
import com.github.irmindev.graph_news.model.entity.User;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
    // Buscar noticias por autor
    List<News> findByAuthor(User author);
    
    // Paginación de noticias por autor
    Page<News> findByAuthor(User author, Pageable pageable);
    
    // Filtrar noticias por rango de fechas
    List<News> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    Page<News> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // Obtener las noticias más recientes
    List<News> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query(value = "SELECT * FROM news n WHERE " +
           "to_tsvector('english', n.title) @@ plainto_tsquery('english', :query) OR " +
           "to_tsvector('english', n.content) @@ plainto_tsquery('english', :query)",
           countQuery = "SELECT count(*) FROM news n WHERE " +
           "to_tsvector('english', n.title) @@ plainto_tsquery('english', :query) OR " +
           "to_tsvector('english', n.content) @@ plainto_tsquery('english', :query)",
           nativeQuery = true)
    Page<News> searchByTitleOrContent(@Param("query") String query, Pageable pageable);

    @Query("SELECT n FROM News n WHERE " +
           "LOWER(n.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<News> searchByTitleOrContentLike(@Param("query") String query, Pageable pageable);
}
