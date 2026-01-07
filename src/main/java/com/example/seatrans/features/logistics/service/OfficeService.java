package com.example.seatrans.features.logistics.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.logistics.dto.CreateOfficeRequest;
import com.example.seatrans.features.logistics.dto.OfficeDTO;
import com.example.seatrans.features.logistics.model.Office;
import com.example.seatrans.features.logistics.model.Province;
import com.example.seatrans.features.logistics.repository.OfficeRepository;
import com.example.seatrans.features.logistics.repository.ProvinceRepository;

@Service
@Transactional(readOnly = true)
public class OfficeService {

    @Autowired
    private OfficeRepository officeRepository;
    
    @Autowired
    private ProvinceRepository provinceRepository;
    
    // Mapping province names to regions
    private static final Map<String, String> PROVINCE_REGIONS = new HashMap<>();
    
    static {
        // Northern Vietnam
        PROVINCE_REGIONS.put("Hà Nội", "Northern Vietnam");
        PROVINCE_REGIONS.put("Hải Phòng", "Northern Vietnam");
        PROVINCE_REGIONS.put("Quảng Ninh", "Northern Vietnam");
        
        // Central Vietnam
        PROVINCE_REGIONS.put("Đà Nẵng", "Central Vietnam");
        PROVINCE_REGIONS.put("Quảng Nam", "Central Vietnam");
        PROVINCE_REGIONS.put("Khánh Hòa", "Central Vietnam");
        
        // Southern Vietnam
        PROVINCE_REGIONS.put("Hồ Chí Minh", "Southern Vietnam");
        PROVINCE_REGIONS.put("Bà Rịa - Vũng Tàu", "Southern Vietnam");
        PROVINCE_REGIONS.put("Đồng Nai", "Southern Vietnam");
        
        // Mekong Delta
        PROVINCE_REGIONS.put("Cần Thơ", "Mekong Delta");
        PROVINCE_REGIONS.put("An Giang", "Mekong Delta");
        PROVINCE_REGIONS.put("Kiên Giang", "Mekong Delta");
    }

    public List<OfficeDTO> getAllActiveOffices() {
        return officeRepository.findAllActiveOffices()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private OfficeDTO convertToDTO(Office office) {
        String provinceName = office.getProvince() != null ? office.getProvince().getName() : "";
        String region = PROVINCE_REGIONS.getOrDefault(provinceName, "Vietnam");
        
        return OfficeDTO.builder()
                .id(office.getId())
                .name(office.getName())
                .city(provinceName)
                .region(region)
                .address(office.getAddress())
                .latitude(office.getLatitude())
                .longitude(office.getLongitude())
                .manager(OfficeDTO.ManagerDTO.builder()
                        .name(office.getManagerName())
                        .title(office.getManagerTitle())
                        .mobile(office.getManagerMobile())
                        .email(office.getManagerEmail())
                        .build())
                .coordinates(OfficeDTO.CoordinatesDTO.builder()
                        .lat(office.getLatitude())
                        .lng(office.getLongitude())
                        .build())
                .isHeadquarter(office.getIsHeadquarter())
                .isActive(office.getIsActive())
                .build();
    }

    @Transactional
    public OfficeDTO createOffice(CreateOfficeRequest request) {
        Province province = provinceRepository.findById(request.getProvinceId())
                .orElseThrow(() -> new RuntimeException("Province not found"));
        
        Office office = Office.builder()
                .province(province)
                .name(request.getName())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .managerName(request.getManagerName())
                .managerTitle(request.getManagerTitle())
                .managerMobile(request.getManagerMobile())
                .managerEmail(request.getManagerEmail())
                .isHeadquarter(request.getIsHeadquarter() != null ? request.getIsHeadquarter() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        
        office = officeRepository.save(office);
        return convertToDTO(office);
    }

    @Transactional
    public OfficeDTO updateOffice(Long id, CreateOfficeRequest request) {
        Optional<Office> existingOffice = officeRepository.findById(id);
        if (!existingOffice.isPresent()) {
            return null;
        }
        
        Province province = provinceRepository.findById(request.getProvinceId())
                .orElseThrow(() -> new RuntimeException("Province not found"));
        
        Office office = existingOffice.get();
        office.setProvince(province);
        office.setName(request.getName());
        office.setAddress(request.getAddress());
        if (request.getLatitude() != null) {
            office.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            office.setLongitude(request.getLongitude());
        }
        office.setManagerName(request.getManagerName());
        office.setManagerTitle(request.getManagerTitle());
        office.setManagerMobile(request.getManagerMobile());
        office.setManagerEmail(request.getManagerEmail());
        office.setIsHeadquarter(request.getIsHeadquarter() != null ? request.getIsHeadquarter() : false);
        office.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        office = officeRepository.save(office);
        return convertToDTO(office);
    }

    @Transactional
    public boolean deleteOffice(Long id) {
        Optional<Office> office = officeRepository.findById(id);
        if (!office.isPresent()) {
            return false;
        }
        officeRepository.deleteById(id);
        return true;
    }
}
