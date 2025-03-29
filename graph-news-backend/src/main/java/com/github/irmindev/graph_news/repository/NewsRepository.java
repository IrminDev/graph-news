package com.github.irmindev.graph_news.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.github.irmindev.graph_news.model.entity.News;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {
    
}
