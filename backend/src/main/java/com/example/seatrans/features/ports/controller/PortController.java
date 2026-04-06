package com.example.seatrans.features.ports.controller;

import com.example.seatrans.shared.dto.ApiResponse;
import com.example.seatrans.features.ports.dto.PortDTO;
import com.example.seatrans.features.ports.dto.CreatePortRequest;
import com.example.seatrans.features.ports.dto.UpdatePortHasInfoRequest;
import com.example.seatrans.features.ports.dto.PortImportResultDTO;
import com.example.seatrans.features.ports.service.PortService;
import com.example.seatrans.features.ports.service.PortImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ports")
public class PortController {

    @Autowired
    private PortService portService;

    @Autowired
    private PortImportService portImportService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PortDTO>>> getAllPorts() {
        try {
            List<PortDTO> ports = portService.getAllPorts();
            return ResponseEntity.ok(ApiResponse.success("Ports retrieved successfully", ports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving ports"));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PortDTO>>> getActivePorts() {
        try {
            List<PortDTO> ports = portService.getActivePorts();
            return ResponseEntity.ok(ApiResponse.success("Active ports retrieved successfully", ports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving active ports"));
        }
    }

    @GetMapping("/province/{provinceId}")
    public ResponseEntity<ApiResponse<List<PortDTO>>> getPortsByProvince(@PathVariable Long provinceId) {
        try {
            List<PortDTO> ports = portService.getPortsByProvince(provinceId);
            return ResponseEntity.ok(ApiResponse.success("Ports retrieved successfully", ports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving ports"));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PortDTO>>> searchPorts(@RequestParam(required = false) String query) {
        try {
            List<PortDTO> ports = portService.searchPorts(query);
            return ResponseEntity.ok(ApiResponse.success("Search completed successfully", ports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error searching ports"));
        }
    }

    @GetMapping("/province/{provinceId}/search")
    public ResponseEntity<ApiResponse<List<PortDTO>>> searchPortsByProvince(@PathVariable Long provinceId, @RequestParam(required = false) String query) {
        try {
            List<PortDTO> ports = portService.searchPortsByProvince(provinceId, query);
            return ResponseEntity.ok(ApiResponse.success("Search completed successfully", ports));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error searching ports"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PortDTO>> getPortById(@PathVariable Long id) {
        try {
            PortDTO port = portService.getPortById(id);
            if (port == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Port not found"));
            }
            return ResponseEntity.ok(ApiResponse.success("Port retrieved successfully", port));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error retrieving port"));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PortDTO>> createPort(@RequestBody CreatePortRequest request) {
        try {
            PortDTO port = portService.createPort(request);
            if (port == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Province not found"));
            }
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Port created successfully", port));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error creating port"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PortDTO>> updatePort(@PathVariable Long id, @RequestBody CreatePortRequest request) {
        try {
            PortDTO port = portService.updatePort(id, request);
            if (port == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Port not found"));
            }
            return ResponseEntity.ok(ApiResponse.success("Port updated successfully", port));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating port"));
        }
    }

    @PatchMapping("/{id}/has-info")
    public ResponseEntity<ApiResponse<PortDTO>> updateHasInfo(@PathVariable Long id, @RequestBody UpdatePortHasInfoRequest request) {
        try {
            if (request == null || request.getHasInfo() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("hasInfo is required"));
            }

            PortDTO port = portService.updateHasInfo(id, request.getHasInfo());
            if (port == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Port not found"));
            }
            return ResponseEntity.ok(ApiResponse.success("Port hasInfo updated successfully", port));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error updating port hasInfo"));
        }
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PortImportResultDTO>> importPorts(
            @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("No file provided"));
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (!filename.endsWith(".csv") && !filename.endsWith(".xlsx") && !filename.endsWith(".xls")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Unsupported file format. Only .csv, .xlsx, .xls are accepted."));
        }

        try {
            PortImportResultDTO result = portImportService.importFile(file);
            String message = String.format(
                    "Import completed: %d imported, %d duplicates, %d skipped, %d failed",
                    result.getImported(), result.getDuplicates(), result.getSkipped(), result.getFailed());
            return ResponseEntity.ok(ApiResponse.success(message, result));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error processing import file: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePort(@PathVariable Long id) {
        try {
            portService.deletePort(id);
            return ResponseEntity.ok(ApiResponse.success("Port deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error deleting port"));
        }
    }
}

