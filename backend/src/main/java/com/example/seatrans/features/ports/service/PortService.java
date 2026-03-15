package com.example.seatrans.features.ports.service;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.seatrans.features.ports.dto.CreatePortRequest;
import com.example.seatrans.features.ports.dto.PortDTO;
import com.example.seatrans.features.ports.model.Port;
import com.example.seatrans.features.ports.repository.PortRepository;
import com.example.seatrans.features.provinces.model.Province;
import com.example.seatrans.features.provinces.repository.ProvinceRepository;
import com.example.seatrans.shared.mapper.EntityMapper;

@Service
public class PortService {

    private static final Pattern PORT_OF_CALL_SUFFIX_PATTERN = Pattern.compile("(\\s+(PORT|TERMINAL|ANCHORAGE))+$", Pattern.CASE_INSENSITIVE);

    @Autowired
    private PortRepository portRepository;

    @Autowired
    private ProvinceRepository provinceRepository;

    @Autowired
    private EntityMapper entityMapper;

    public List<PortDTO> getAllPorts() {
        return portRepository.findAll()
                .stream()
                .map(entityMapper::toPortDTO)
                .collect(Collectors.toList());
    }

    public List<PortDTO> getActivePorts() {
        return portRepository.findByIsActiveTrue()
                .stream()
                .map(entityMapper::toPortDTO)
                .collect(Collectors.toList());
    }

    public List<PortDTO> getPortsByProvince(Long provinceId) {
        return portRepository.findByProvinceIdAndIsActiveTrue(provinceId)
                .stream()
                .map(entityMapper::toPortDTO)
                .collect(Collectors.toList());
    }

    public List<PortDTO> searchPorts(String searchQuery) {
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return getActivePorts();
        }
        return portRepository.findByNameContainingIgnoreCase(searchQuery)
                .stream()
                .filter(port -> Boolean.TRUE.equals(port.getIsActive()))
                .map(entityMapper::toPortDTO)
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
                .map(entityMapper::toPortDTO)
                .collect(Collectors.toList());
    }

    public PortDTO getPortById(Long id) {
        return portRepository.findById(id)
                .map(entityMapper::toPortDTO)
                .orElse(null);
    }

    public PortDTO createPort(CreatePortRequest request) {
        // Check if province exists
        Optional<Province> provinceOpt = provinceRepository.findById(request.getProvinceId());
        if (provinceOpt.isEmpty()) {
            return null;
        }

        String normalizedName = normalizePortName(request.getName());
        String normalizedPortOfCall = normalizePortOfCall(request.getPortOfCall(), normalizedName);

        // Check if port already exists
        Optional<Port> existing = portRepository.findByNameAndProvinceId(
            normalizedName,
                request.getProvinceId()
        );
        if (existing.isPresent()) {
            return entityMapper.toPortDTO(existing.get());
        }

        Port port = new Port();
        port.setName(normalizedName);
        port.setPortOfCall(normalizedPortOfCall);
        port.setProvince(provinceOpt.get());
        port.setIsActive(true);

        Port savedPort = portRepository.save(port);
        return entityMapper.toPortDTO(savedPort);
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

        String normalizedName = normalizePortName(request.getName());
        String normalizedPortOfCall = normalizePortOfCall(request.getPortOfCall(), normalizedName);

        Port port = existingOpt.get();
        port.setName(normalizedName);
        port.setPortOfCall(normalizedPortOfCall);
        port.setProvince(provinceOpt.get());

        Port updatedPort = portRepository.save(port);
        return entityMapper.toPortDTO(updatedPort);
    }

    public void deletePort(Long id) {
        portRepository.deleteById(id);
    }

    public long getPortCount() {
        return portRepository.count();
    }

    private String normalizePortName(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().replaceAll("\\s+", " ");
    }

    private String normalizePortOfCall(String providedPortOfCall, String normalizedName) {
        if (providedPortOfCall != null && !providedPortOfCall.trim().isEmpty()) {
            return providedPortOfCall.trim().replaceAll("\\s+", " ").toUpperCase();
        }

        String uppercaseName = normalizedName.toUpperCase();
        String stripped = PORT_OF_CALL_SUFFIX_PATTERN.matcher(uppercaseName).replaceAll("").trim();
        return stripped.isEmpty() ? uppercaseName : stripped;
    }
}
