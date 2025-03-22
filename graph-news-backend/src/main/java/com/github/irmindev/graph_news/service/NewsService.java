package com.github.irmindev.graph_news.service;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.URI;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.github.irmindev.graph_news.model.dto.NewsDTO;
import com.github.irmindev.graph_news.model.entity.News;
import com.github.irmindev.graph_news.model.entity.User;
import com.github.irmindev.graph_news.model.exception.EntityNotFoundException;
import com.github.irmindev.graph_news.model.exception.ResourceNotFoundException;
import com.github.irmindev.graph_news.model.exception.news.FileIssueException;
import com.github.irmindev.graph_news.model.mapper.UserMapper;
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
        StringBuilder source = new StringBuilder();
        URLConnection connection = null;
        try {
            connection = new URI(url).toURL().openConnection();
            BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                source.append(inputLine);
            }
            in.close();
        } catch (Exception e) {
            throw new ResourceNotFoundException("Resource not found");
        }
        NewsDTO newsDTO = htmlSanitizer.sanitize(source.toString());
        return createNews(newsDTO.getTitle(), newsDTO.getContent(), authorId);
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
        return new NewsDTO(savedDocument.getId(), savedDocument.getTitle(), savedDocument.getContent(), UserMapper.toDto(author.get()));
    }
}
