package com.github.irmindev.graph_news.model.nlp;

import java.util.ArrayList;
import java.util.List;


public class Entity {
    private String name;
    private String type;
    private int mentionCount;
    private List<Integer> positions = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getMentionCount() {
        return mentionCount;
    }

    public void setMentionCount(int mentionCount) {
        this.mentionCount = mentionCount;
    }

    public List<Integer> getPositions() {
        return positions;
    }

    public void setPositions(List<Integer> positions) {
        this.positions = positions;
    }
    
    public void addPosition(int position) {
        if (!positions.contains(position)) {
            positions.add(position);
        }
    }
}
