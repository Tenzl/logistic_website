package com.example.seatrans.features.logistics.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.logistics.dto.CreateOfficeRequest;
import com.example.seatrans.features.logistics.dto.OfficeDTO;
import com.example.seatrans.features.logistics.model.Office;
import com.example.seatrans.features.provinces.model.Province;
import com.example.seatrans.features.logistics.repository.OfficeRepository;
import com.example.seatrans.features.provinces.repository.ProvinceRepository;

@Service
@Transactional(readOnly = true)
public class OfficeService {

    @Autowired
    private OfficeRepository officeRepository;
    
    @Autowired
    private ProvinceRepository provinceRepository;
    
    public List<OfficeDTO> getAllActiveOffices() {
        return officeRepository.findAllActiveOffices()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private OfficeDTO convertToDTO(Office office) {
        String provinceName = office.getProvince() != null ? office.getProvince().getName() : "";
        String region = ""; // No region mapping required
        
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
