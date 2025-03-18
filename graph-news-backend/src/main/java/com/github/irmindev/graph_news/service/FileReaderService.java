package com.github.irmindev.graph_news.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.github.irmindev.graph_news.model.exception.FileIssueException;

@Service
public class FileReaderService {
    public String readPdf(MultipartFile file) throws FileIssueException{
        File pdfFile = new File("file.tmp");
        try (OutputStream os = new FileOutputStream(pdfFile)){
            os.write(file.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
            throw new FileIssueException(e.getMessage());
        }

        try (PDDocument document = Loader.loadPDF(pdfFile)){
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (IOException e) {
            e.printStackTrace();
            throw new FileIssueException(e.getMessage());
        }
    }

    public String readTxt(MultipartFile file) throws FileIssueException{
        try {
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            e.printStackTrace();
            throw new FileIssueException(e.getMessage());
        }
    }

    public String readDocx(MultipartFile file) throws FileIssueException{
        File docxFile = new File("file.tmp");
        try (OutputStream os = new FileOutputStream(docxFile)){
            os.write(file.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
            throw new FileIssueException(e.getMessage());
        }

        try (XWPFDocument document = new XWPFDocument(new FileInputStream(docxFile))){
            return document.getParagraphs().stream().map(p -> p.getText()).reduce("", (a,b) -> {
                StringBuilder sb = new StringBuilder(a);
                sb.append("\n");
                sb.append(b);
                return sb.toString();
            });
        } catch (IOException e) {
            e.printStackTrace();
            throw new FileIssueException(e.getMessage());
        }

    }
}
