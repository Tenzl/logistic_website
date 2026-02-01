package com.example.seatrans.features.provinces.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.provinces.dto.CreateProvinceRequest;
import com.example.seatrans.features.provinces.dto.ProvinceDTO;
import com.example.seatrans.features.provinces.model.Province;
import com.example.seatrans.features.provinces.repository.ProvinceRepository;
import com.example.seatrans.shared.mapper.EntityMapper;

@Service
@Transactional(readOnly = true)
public class ProvinceService {

    @Autowired
    private ProvinceRepository provinceRepository;

    @Autowired
    private EntityMapper entityMapper;

    public List<ProvinceDTO> getAllProvinces() {
        return provinceRepository.findAll()
                .stream()
                .sorted((p1, p2) -> p1.getName().compareToIgnoreCase(p2.getName()))
                .map(entityMapper::toProvinceDTO)
                .collect(Collectors.toList());
    }

    public List<ProvinceDTO> getActiveProvinces() {
        return provinceRepository.findByIsActiveTrue()
                .stream()
                .filter(province -> province.getPorts() != null && !province.getPorts().isEmpty())
                .sorted((p1, p2) -> p1.getName().compareToIgnoreCase(p2.getName()))
                .map(entityMapper::toProvinceDTO)
                .collect(Collectors.toList());
    }

    public List<ProvinceDTO> searchProvinces(String searchQuery) {
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return getActiveProvinces();
        }
        return provinceRepository.findByNameContainingIgnoreCase(searchQuery)
                .stream()
                .filter(Province::getIsActive)
                .sorted((p1, p2) -> p1.getName().compareToIgnoreCase(p2.getName()))
                .map(entityMapper::toProvinceDTO)
                .collect(Collectors.toList());
    }

    public ProvinceDTO getProvinceById(Long id) {
        return provinceRepository.findById(id)
                .map(entityMapper::toProvinceDTO)
                .orElse(null);
    }

    public ProvinceDTO getProvinceByName(String name) {
        return provinceRepository.findByName(name)
                .map(entityMapper::toProvinceDTO)
                .orElse(null);
    }

    public ProvinceDTO createProvince(CreateProvinceRequest request) {
        // Check if province already exists
        Optional<Province> existing = provinceRepository.findByName(request.getName());
        if (existing.isPresent()) {
            return entityMapper.toProvinceDTO(existing.get());
        }

        Province province = new Province();
        province.setName(request.getName());
        province.setIsActive(true);

        Province savedProvince = provinceRepository.save(province);
        return entityMapper.toProvinceDTO(savedProvince);
    }

    public ProvinceDTO updateProvince(Long id, CreateProvinceRequest request) {
        Optional<Province> existingOpt = provinceRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return null;
        }

        Province province = existingOpt.get();
        province.setName(request.getName());

        Province updatedProvince = provinceRepository.save(province);
        return entityMapper.toProvinceDTO(updatedProvince);
    }

    public void deleteProvince(Long id) {
        provinceRepository.deleteById(id);
    }

    public long getProvinceCount() {
        return provinceRepository.count();
    }
}
