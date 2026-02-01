package com.example.seatrans.features.logistics.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.seatrans.features.gallery.repository.GalleryImageRepository;
import com.example.seatrans.features.logistics.dto.CreateServiceTypeRequest;
import com.example.seatrans.features.logistics.dto.ServiceTypeDTO;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;
import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;
import com.example.seatrans.shared.mapper.EntityMapper;

@Service
public class ServiceTypeService {

    @Autowired
    private ServiceTypeRepository serviceTypeRepository;

    @Autowired
    private GalleryImageRepository galleryImageRepository;

    @Autowired
    private EntityMapper entityMapper;

    public List<ServiceTypeDTO> getAllServiceTypes() {
        return serviceTypeRepository.findAll()
                .stream()
                .map(entityMapper::toServiceTypeDTO)
                .collect(Collectors.toList());
    }

    public List<ServiceTypeDTO> getActiveServiceTypes() {
        return serviceTypeRepository.findByIsActiveTrue()
                .stream()
                .map(entityMapper::toServiceTypeDTO)
                .collect(Collectors.toList());
    }

    public List<ServiceTypeDTO> searchServiceTypes(String searchQuery) {
        if (searchQuery == null || searchQuery.trim().isEmpty()) {
            return getActiveServiceTypes();
        }
        return serviceTypeRepository.findByNameContainingIgnoreCase(searchQuery)
                .stream()
                .filter(ServiceTypeEntity::getIsActive)
                .map(entityMapper::toServiceTypeDTO)
                .collect(Collectors.toList());
    }

    public ServiceTypeDTO getServiceTypeById(Long id) {
        return serviceTypeRepository.findById(id)
                .map(entityMapper::toServiceTypeDTO)
                .orElse(null);
    }

    public ServiceTypeDTO getServiceTypeByName(String name) {
        return serviceTypeRepository.findByName(name)
                .map(entityMapper::toServiceTypeDTO)
                .orElse(null);
    }

    public ServiceTypeDTO createServiceType(CreateServiceTypeRequest request) {
        // Check if service type already exists
        Optional<ServiceTypeEntity> existing = serviceTypeRepository.findByName(request.getName());
        if (existing.isPresent()) {
            return entityMapper.toServiceTypeDTO(existing.get());
        }

        ServiceTypeEntity serviceType = new ServiceTypeEntity();
        serviceType.setName(request.getName());
        serviceType.setDisplayName(request.getDisplayName());
        serviceType.setDescription(request.getDescription());
        serviceType.setIsActive(true);

        ServiceTypeEntity savedServiceType = serviceTypeRepository.save(serviceType);
        return entityMapper.toServiceTypeDTO(savedServiceType);
    }

    public ServiceTypeDTO updateServiceType(Long id, CreateServiceTypeRequest request) {
        Optional<ServiceTypeEntity> existingOpt = serviceTypeRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return null;
        }

        ServiceTypeEntity serviceType = existingOpt.get();
        serviceType.setName(request.getName());
        serviceType.setDisplayName(request.getDisplayName());
        serviceType.setDescription(request.getDescription());

        ServiceTypeEntity updatedServiceType = serviceTypeRepository.save(serviceType);
        return entityMapper.toServiceTypeDTO(updatedServiceType);
    }

    public void deleteServiceType(Long id) {
        long imageCount = galleryImageRepository.countByServiceTypeId(id);
        if (imageCount > 0) {
            throw new IllegalStateException("Cannot delete service type while " + imageCount + " images are linked to it");
        }
        serviceTypeRepository.deleteById(id);
    }

    public long getServiceTypeCount() {
        return serviceTypeRepository.count();
    }
}
