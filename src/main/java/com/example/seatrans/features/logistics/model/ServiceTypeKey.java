package com.example.seatrans.features.logistics.model;

import java.util.Arrays;
import java.util.Optional;

public enum ServiceTypeKey {
    SHIPPING_AGENCY(1L, "SHIPPING AGENCY", "Shipping Agency"),
    FREIGHT_FORWARDING(2L, "FREIGHT FORWARDING", "Freight Forwarding"),
    CHARTERING(3L, "CHARTERING", "Chartering & Broking"),
    LOGISTICS(4L, "LOGISTICS", "Total Logistics"),
    SPECIAL_REQUEST(5L, "SPECIAL REQUEST", "Special Request");

    private final long id;
    private final String dbName;
    private final String displayName;

    ServiceTypeKey(long id, String dbName, String displayName) {
        this.id = id;
        this.dbName = dbName;
        this.displayName = displayName;
    }

    public long getId() {
        return id;
    }

    public String getDbName() {
        return dbName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Optional<ServiceTypeKey> fromId(Long id) {
        if (id == null) return Optional.empty();
        return Arrays.stream(values()).filter(v -> v.id == id).findFirst();
    }

    public static Optional<ServiceTypeKey> fromDbName(String name) {
        if (name == null) return Optional.empty();
        return Arrays.stream(values()).filter(v -> v.dbName.equalsIgnoreCase(name)).findFirst();
    }
}
