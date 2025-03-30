package com.github.irmindev.graph_news.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import com.github.irmindev.graph_news.model.dto.NewsDTO;
import com.github.irmindev.graph_news.model.entity.News;
import com.github.irmindev.graph_news.model.entity.User;
import com.github.irmindev.graph_news.model.exception.EntityNotFoundException;
import com.github.irmindev.graph_news.model.exception.ResourceNotFoundException;
import com.github.irmindev.graph_news.model.exception.news.FileIssueException;
import com.github.irmindev.graph_news.model.exception.news.HTMLInvalidFormatException;
import com.github.irmindev.graph_news.model.mapper.NewsMapper;
import com.github.irmindev.graph_news.repository.NewsRepository;
import com.github.irmindev.graph_news.repository.UserRepository;
import com.github.irmindev.graph_news.utils.HTMLSanitizer;

@Service
public class NewsService {
    private static final Logger logger = LoggerFactory.getLogger(NewsService.class);
    
    private final HTMLSanitizer htmlSanitizer;
    private final NewsRepository newsRepository;
    private final UserRepository userRepository;

    @Autowired
    public NewsService(HTMLSanitizer htmlSanitizer, NewsRepository newsRepository, UserRepository userRepository) {
        this.htmlSanitizer = htmlSanitizer;
        this.newsRepository = newsRepository;
        this.userRepository = userRepository;
    }

    public NewsDTO createFromUrl(String url, Long authorId) throws ResourceNotFoundException {
        // Configure Chrome to run in headless mode
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless"); // Run in headless mode
        options.addArguments("--disable-gpu"); // Disable GPU acceleration
        options.addArguments("--no-sandbox"); // Required for Docker
        options.addArguments("--disable-dev-shm-usage"); // Overcome limited resource problems

        // Set the path to ChromeDriver (already installed in the Docker image)
        System.setProperty("webdriver.chrome.driver", "/usr/bin/chromedriver");

        // Initialize the WebDriver
        WebDriver driver = new ChromeDriver(options);

        try {
            // Navigate to the URL
            driver.get(url);

            // Wait for the page to load (you can use explicit waits for dynamic content)
            Thread.sleep(2000); // Adjust the sleep time as needed

            // Get the fully rendered HTML
            String html = driver.getPageSource();
            if (html == null || html.trim().isEmpty()) {
                throw new ResourceNotFoundException("Retrieved empty HTML content from URL");
            }

            // Sanitize the HTML and create the NewsDTO
            try {
                NewsDTO newsDTO = htmlSanitizer.sanitize(html);
                return createNews(newsDTO.getTitle(), newsDTO.getContent(), authorId);
            } catch (HTMLInvalidFormatException e) {
                throw new ResourceNotFoundException("Failed to extract content from HTML: " + e.getMessage());
            }
        } catch (Exception e) {
            logger.error("Error fetching from URL: {}", e.getMessage(), e);
            throw new ResourceNotFoundException("Failed to fetch resource: " + e.getMessage());
        } finally {
            // Close the browser
            if (driver != null) {
                try {
                    driver.quit();
                } catch (Exception e) {
                    logger.warn("Error closing WebDriver: {}", e.getMessage());
                }
            }
        }
    }

    public NewsDTO createFromPdf(MultipartFile file, String title, Long authorId) throws FileIssueException{
        File pdfFile = new File("file.tmp");
        try (OutputStream os = new FileOutputStream(pdfFile)){
            os.write(file.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
            throw new FileIssueException(e.getMessage());
        }

        try (PDDocument document = Loader.loadPDF(pdfFile)){
            PDFTextStripper stripper = new PDFTextStripper();
            String content = stripper.getText(document);
            return createNews(title, content, authorId);
        } catch (IOException e) {
            e.printStackTrace();
            throw new FileIssueException(e.getMessage());
        }
    }

    public NewsDTO createFromTxt(MultipartFile file, String title, Long authorId) throws FileIssueException{
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            return createNews(title, content, authorId);
        } catch (IOException e) {
            e.printStackTrace();
            throw new FileIssueException(e.getMessage());
        }
    }

    public NewsDTO createFromDocx(MultipartFile file, String title, Long authorId) throws FileIssueException{
        File docxFile = new File("file.tmp");
        try (OutputStream os = new FileOutputStream(docxFile)){
            os.write(file.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
            throw new FileIssueException(e.getMessage());
        }

        try (XWPFDocument document = new XWPFDocument(new FileInputStream(docxFile))){
            String content = document.getParagraphs().stream().map(p -> p.getText()).reduce("", (a,b) -> {
                StringBuilder sb = new StringBuilder(a);
                sb.append("\n");
                sb.append(b);
                return sb.toString();
            });
            return createNews(title, content, authorId);
        } catch (IOException e) {
            e.printStackTrace();
            throw new FileIssueException(e.getMessage());
        }
    }

    public NewsDTO createNews(String title, String content, Long authorId) throws EntityNotFoundException{
        Optional<User> author = userRepository.findById(authorId);
        if (author.isEmpty()) {
            throw new EntityNotFoundException();
        }
        
        try {
            News newDocument = new News(title, content, author.get());
            News savedDocument = newsRepository.save(newDocument);
            return NewsMapper.toDto(savedDocument);
        } catch (Exception e) {
            logger.error("Error saving news: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save news: " + e.getMessage());
        }
    }

    // MÉTODOS PARA CONSULTAS

    /**
     * Obtiene todas las noticias con paginación
     */
    public Page<NewsDTO> getAllNews(Pageable pageable) {
        try {
            Page<News> newsPage = newsRepository.findAll(pageable);
            return newsPage.map(NewsMapper::toDto);
        } catch (Exception e) {
            logger.error("Error retrieving all news: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve news: " + e.getMessage());
        }
    }

    /**
     * Obtiene una noticia por su ID
     */
    public NewsDTO getNewsById(Long id) throws EntityNotFoundException {
        if (id == null) {
            throw new IllegalArgumentException("News ID cannot be null");
        }
        
        try {
            News news = newsRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException());
            return NewsMapper.toDto(news);
        } catch (EntityNotFoundException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error retrieving news by ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve news: " + e.getMessage());
        }
    }

    /**
     * Obtiene noticias por autor
     */
    public List<NewsDTO> getNewsByAuthor(Long authorId) throws EntityNotFoundException {
        if (authorId == null) {
            throw new IllegalArgumentException("Author ID cannot be null");
        }
        
        try {
            Optional<User> author = userRepository.findById(authorId);
            if (author.isEmpty()) {
                throw new EntityNotFoundException();
            }
            
            List<News> news = newsRepository.findByAuthor(author.get());
            return NewsMapper.toDto(news);
        } catch (EntityNotFoundException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error retrieving news by author ID {}: {}", authorId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve news: " + e.getMessage());
        }
    }

    /**
     * Obtiene noticias por autor con paginación
     */
    public Page<NewsDTO> getNewsByAuthor(Long authorId, Pageable pageable) throws EntityNotFoundException {
        if (authorId == null) {
            throw new IllegalArgumentException("Author ID cannot be null");
        }
        
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable cannot be null");
        }
        
        try {
            Optional<User> author = userRepository.findById(authorId);
            if (author.isEmpty()) {
                throw new EntityNotFoundException();
            }
            
            Page<News> newsPage = newsRepository.findByAuthor(author.get(), pageable);
            return newsPage.map(NewsMapper::toDto);
        } catch (EntityNotFoundException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error retrieving paged news by author ID {}: {}", authorId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve news: " + e.getMessage());
        }
    }

    /**
     * Busca noticias por título o contenido
     */
    public Page<NewsDTO> searchNews(String searchTerm, Pageable pageable) {
        if (searchTerm == null) {
            throw new IllegalArgumentException("Search term cannot be null");
        }
        
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable cannot be null");
        }
        
        try {
            Page<News> newsPage = newsRepository.searchByTitleOrContent(searchTerm, pageable);
            return newsPage.map(NewsMapper::toDto);
        } catch (Exception e) {
            logger.error("Error searching news with term '{}': {}", searchTerm, e.getMessage(), e);
            throw new RuntimeException("Failed to search news: " + e.getMessage());
        }
    }

    /**
     * Obtiene noticias entre dos fechas
     */
    public List<NewsDTO> getNewsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        validateDateRange(startDate, endDate);
        
        try {
            List<News> news = newsRepository.findByCreatedAtBetween(startDate, endDate);
            return NewsMapper.toDto(news);
        } catch (Exception e) {
            logger.error("Error retrieving news by date range: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve news by date range: " + e.getMessage());
        }
    }

    /**
     * Obtiene noticias entre dos fechas con paginación
     */
    public Page<NewsDTO> getNewsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        validateDateRange(startDate, endDate);
        
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable cannot be null");
        }
        
        try {
            Page<News> newsPage = newsRepository.findByCreatedAtBetween(startDate, endDate, pageable);
            return newsPage.map(NewsMapper::toDto);
        } catch (Exception e) {
            logger.error("Error retrieving paged news by date range: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve news by date range: " + e.getMessage());
        }
    }

    /**
     * Obtiene las noticias más recientes
     */
    public List<NewsDTO> getLatestNews(int limit) {
        if (limit <= 0) {
            throw new IllegalArgumentException("Limit must be greater than zero");
        }
        
        try {
            Pageable pageable = Pageable.ofSize(limit);
            List<News> news = newsRepository.findAllByOrderByCreatedAtDesc(pageable);
            return NewsMapper.toDto(news);
        } catch (Exception e) {
            logger.error("Error retrieving latest news: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve latest news: " + e.getMessage());
        }
    }
    
    private void validateDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null) {
            throw new IllegalArgumentException("Start date cannot be null");
        }
        
        if (endDate == null) {
            throw new IllegalArgumentException("End date cannot be null");
        }
        
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
    }
}
