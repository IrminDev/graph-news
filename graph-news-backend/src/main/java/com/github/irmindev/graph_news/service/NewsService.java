package com.github.irmindev.graph_news.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Autowired;
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
import com.github.irmindev.graph_news.model.mapper.NewsMapper;
import com.github.irmindev.graph_news.repository.NewsRepository;
import com.github.irmindev.graph_news.repository.UserRepository;
import com.github.irmindev.graph_news.utils.HTMLSanitizer;

@Service
public class NewsService {
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

            // Sanitize the HTML and create the NewsDTO
            NewsDTO newsDTO = htmlSanitizer.sanitize(html);
            return createNews(newsDTO.getTitle(), newsDTO.getContent(), authorId);
        } catch (Exception e) {
            throw new ResourceNotFoundException("Failed to fetch resource: " + e.getMessage());
        } finally {
            // Close the browser
            driver.quit();
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
        News newDocument = new News(title, content, author.get());
        News savedDocument = newsRepository.save(newDocument);
        return NewsMapper.toDto(savedDocument);
    }
}
