package com.example.seatrans.features.ports.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.seatrans.features.ports.dto.CreatePortRequest;
import com.example.seatrans.features.ports.dto.PortDTO;
import com.example.seatrans.features.ports.dto.UpdatePortHasInfoRequest;
import com.example.seatrans.features.ports.service.PortService;
import com.example.seatrans.shared.dto.ApiResponse;

@RestController
@RequestMapping("/api/v1/ports")
public class PortController {

    @Autowired
    private PortService portService;

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
    public ResponseEntity<ApiResponse<PortDTO>> updatePortHasInfo(
            @PathVariable Long id,
            @RequestBody UpdatePortHasInfoRequest request) {
        try {
            Integer hasInfo = request != null ? request.getHasInfo() : null;
            if (hasInfo == null || (hasInfo != 0 && hasInfo != 1)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("hasInfo must be 0 or 1"));
            }

            PortDTO port = portService.updatePortHasInfo(id, hasInfo);
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

