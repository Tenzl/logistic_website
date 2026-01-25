package com.example.seatrans.features.ports.service;

import com.example.seatrans.features.ports.dto.PortDTO;
import com.example.seatrans.features.ports.dto.CreatePortRequest;
import com.example.seatrans.features.ports.model.Port;
import com.example.seatrans.features.provinces.model.Province;
import com.example.seatrans.features.ports.repository.PortRepository;
import com.example.seatrans.features.provinces.repository.ProvinceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PortService {

    @Autowired
    private PortRepository portRepository;

    @Autowired
    private ProvinceRepository provinceRepository;

    public List<PortDTO> getAllPorts() {
        return portRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PortDTO> getActivePorts() {
        return portRepository.findByIsActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PortDTO> getPortsByProvince(Long provinceId) {
        return portRepository.findByProvinceIdAndIsActiveTrue(provinceId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PortDTO> searchPorts(String searchQuery) {
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return getActivePorts();
        }
        return portRepository.findByNameContainingIgnoreCase(searchQuery)
                .stream()
                .filter(port -> Boolean.TRUE.equals(port.getIsActive()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PortDTO> searchPortsByProvince(Long provinceId, String searchQuery) {
        List<Port> ports;
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            ports = portRepository.findByProvinceIdAndIsActiveTrue(provinceId);
        } else {
            ports = portRepository.findByNameContainingIgnoreCase(searchQuery)
                    .stream()
                    .filter(p -> p.getProvince().getId().equals(provinceId) && Boolean.TRUE.equals(p.getIsActive()))
                    .collect(Collectors.toList());
        }
        return ports.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PortDTO getPortById(Long id) {
        return portRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public PortDTO createPort(CreatePortRequest request) {
        // Check if province exists
        Optional<Province> provinceOpt = provinceRepository.findById(request.getProvinceId());
        if (provinceOpt.isEmpty()) {
            return null;
        }

        // Check if port already exists
        Optional<Port> existing = portRepository.findByNameAndProvinceId(
                request.getName(),
                request.getProvinceId()
        );
        if (existing.isPresent()) {
            return convertToDTO(existing.get());
        }

        Port port = new Port();
        port.setName(request.getName());
        port.setProvince(provinceOpt.get());
        port.setIsActive(true);

        Port savedPort = portRepository.save(port);
        return convertToDTO(savedPort);
    }

    public PortDTO updatePort(Long id, CreatePortRequest request) {
        Optional<Port> existingOpt = portRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return null;
        }

        Optional<Province> provinceOpt = provinceRepository.findById(request.getProvinceId());
        if (provinceOpt.isEmpty()) {
            return null;
        }

        Port port = existingOpt.get();
        port.setName(request.getName());
        port.setProvince(provinceOpt.get());

        Port updatedPort = portRepository.save(port);
        return convertToDTO(updatedPort);
    }

    public void deletePort(Long id) {
        portRepository.deleteById(id);
    }

    public long getPortCount() {
        return portRepository.count();
    }

    private PortDTO convertToDTO(Port port) {
        String provinceName = port.getProvince() != null ? port.getProvince().getName() : "";
        return new PortDTO(
                port.getId(),
                port.getName(),
                port.getProvince() != null ? port.getProvince().getId() : null,
                provinceName,
                port.getIsActive()
        );
    }
}
