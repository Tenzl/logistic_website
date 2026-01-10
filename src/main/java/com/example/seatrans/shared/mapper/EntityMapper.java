package com.example.seatrans.shared.mapper;

import org.springframework.stereotype.Component;

import com.example.seatrans.features.auth.dto.EmployeeDTO;
import com.example.seatrans.features.auth.dto.UserDTO;
import com.example.seatrans.features.auth.model.Employee;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.customer.dto.CustomerDTO;
import com.example.seatrans.features.customer.model.Customer;
import com.example.seatrans.features.gallery.dto.GalleryImageDTO;
import com.example.seatrans.features.gallery.dto.ImageTypeDTO;
import com.example.seatrans.features.gallery.model.GalleryImage;
import com.example.seatrans.features.gallery.model.ImageTypeEntity;
import com.example.seatrans.features.logistics.dto.PortDTO;
import com.example.seatrans.features.logistics.dto.ProvinceDTO;
import com.example.seatrans.features.logistics.dto.ServiceTypeDTO;
import com.example.seatrans.features.logistics.model.Port;
import com.example.seatrans.features.logistics.model.Province;
import com.example.seatrans.features.logistics.model.ServiceTypeEntity;

/**
 * Mapper class Ã„â€˜Ã¡Â»Æ’ convert giÃ¡Â»Â¯a Entity vÃƒÂ  DTO
 */
@Component
public class EntityMapper {
    
    // ==================== User Mapping ====================
    
    /**
     * Convert User entity sang UserDTO
     */
    public UserDTO toUserDTO(User user) {
        if (user == null) {
            return null;
        }
        
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .company(user.getCompany())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLogin(user.getLastLogin())
                .roles(user.getRoleNames())
                .roleGroup(user.getRoleGroup() != null ? user.getRoleGroup().name() : null)
                .hasCustomerInfo(user.getCustomer() != null)
                .hasEmployeeInfo(user.getEmployee() != null)
                .build();
    }
    
    // ==================== Customer Mapping ====================
    
    /**
     * Convert Customer entity sang CustomerDTO
     */
    public CustomerDTO toCustomerDTO(Customer customer) {
        if (customer == null) {
            return null;
        }
        
        User user = customer.getUser();
        
        return CustomerDTO.builder()
                .id(customer.getId())
                .userId(user != null ? user.getId() : null)
                .customerCode(customer.getCustomerCode())
                .companyName(customer.getCompanyName())
                .taxCode(customer.getTaxCode())
                .customerType(customer.getCustomerType())
                .address(customer.getAddress())
                .city(customer.getCity())
                .country(customer.getCountry())
                .postalCode(customer.getPostalCode())
                .loyaltyPoints(customer.getLoyaltyPoints())
                .membershipLevel(customer.getMembershipLevel())
                .creditLimit(customer.getCreditLimit())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                // User basic info
                .email(user != null ? user.getEmail() : null)
                .fullName(user != null ? user.getFullName() : null)
                .phone(user != null ? user.getPhone() : null)
                .isActive(user != null ? user.getIsActive() : null)
                .build();
    }
    
    /**
     * Convert CustomerDTO sang Customer entity (for create/update)
     */
    public Customer toCustomerEntity(CustomerDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Customer customer = new Customer();
        customer.setId(dto.getId());
        customer.setCompanyName(dto.getCompanyName());
        customer.setTaxCode(dto.getTaxCode());
        customer.setCustomerType(dto.getCustomerType());
        customer.setAddress(dto.getAddress());
        customer.setCity(dto.getCity());
        customer.setCountry(dto.getCountry());
        customer.setPostalCode(dto.getPostalCode());
        customer.setLoyaltyPoints(dto.getLoyaltyPoints());
        customer.setMembershipLevel(dto.getMembershipLevel());
        customer.setCreditLimit(dto.getCreditLimit());
        
        return customer;
    }
    
    // ==================== Employee Mapping ====================
    
    /**
     * Convert Employee entity sang EmployeeDTO
     */
    public EmployeeDTO toEmployeeDTO(Employee employee) {
        if (employee == null) {
            return null;
        }
        
        User user = employee.getUser();
        Employee manager = employee.getManager();
        
        return EmployeeDTO.builder()
            .id(employee.getId())
            .userId(user != null ? user.getId() : null)
            .employeeCode(employee.getEmployeeCode())
            .position(employee.getPosition())
                .hireDate(employee.getHireDate())
                .salary(employee.getSalary())
                .commissionRate(employee.getCommissionRate())
                .managerId(manager != null ? manager.getId() : null)
                .managerName(manager != null && manager.getUser() != null ? manager.getUser().getFullName() : null)
                .managerCode(manager != null ? manager.getEmployeeCode() : null)
                .isActive(employee.getIsActive())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                // User basic info
                .email(user != null ? user.getEmail() : null)
                .fullName(user != null ? user.getFullName() : null)
                .phone(user != null ? user.getPhone() : null)
                .userIsActive(user != null ? user.getIsActive() : null)
                // Calculated fields
                .yearsOfService(employee.getYearsOfService())
                .isManager(!employee.getSubordinates().isEmpty())
                .subordinatesCount(employee.getSubordinates().size())
                .build();
    }
    
    /**
     * Convert EmployeeDTO sang Employee entity (for create/update)
     */
    public Employee toEmployeeEntity(EmployeeDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Employee employee = new Employee();
        employee.setId(dto.getId());
        employee.setPosition(dto.getPosition());
        employee.setHireDate(dto.getHireDate());
        employee.setSalary(dto.getSalary());
        employee.setCommissionRate(dto.getCommissionRate());
        employee.setIsActive(dto.getIsActive());
        
        return employee;
    }
    
    // ==================== Gallery Image Mapping ====================
    
    /**
     * Convert GalleryImage entity to GalleryImageDTO
     */
    public GalleryImageDTO toGalleryImageDTO(GalleryImage image) {
        if (image == null) {
            return null;
        }
        
        return GalleryImageDTO.builder()
                .id(image.getId())
                .serviceType(toServiceTypeDTO(image.getServiceType()))
                .imageType(toImageTypeDTO(image.getImageType()))
                .province(toProvinceDTO(image.getProvince()))
                .port(toPortDTO(image.getPort()))
                .imageUrl(image.getImageUrl())
                .uploadedAt(image.getUploadedAt())
                .uploadedById(image.getUploadedById())
                .build();
    }

    // ==================== Helper Mappings ====================

    public ServiceTypeDTO toServiceTypeDTO(ServiceTypeEntity entity) {
        if (entity == null) return null;
        return new ServiceTypeDTO(entity.getId(), entity.getName(), entity.getDisplayName(), entity.getDescription(), true);
    }

    public ImageTypeDTO toImageTypeDTO(ImageTypeEntity entity) {
        if (entity == null) return null;
        return new ImageTypeDTO(entity.getId(), entity.getServiceType().getId(), entity.getServiceType().getName(), entity.getName(), entity.getDisplayName(), entity.getDescription(), entity.getRequiredImageCount(), true);
    }

    public ProvinceDTO toProvinceDTO(Province entity) {
        if (entity == null) return null;
        
        int portCount = 0;
        java.util.List<String> portNames = new java.util.ArrayList<>();
        
        if (entity.getPorts() != null) {
            portCount = entity.getPorts().size();
            portNames = entity.getPorts().stream()
                    .map(Port::getName)
                    .collect(java.util.stream.Collectors.toList());
        }
        
        return new ProvinceDTO(
                entity.getId(),
                entity.getName(),
                portCount,
                portNames,
                entity.getIsActive()
        );
    }

    public PortDTO toPortDTO(Port entity) {
        if (entity == null) return null;
        return new PortDTO(entity.getId(), entity.getName(), entity.getProvince().getId(), entity.getProvince().getName(), true);
    }
    
}


