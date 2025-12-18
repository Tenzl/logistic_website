import os
import re

root_dir = r"d:\University\Actual\seatrans\src\main\java"

mappings = [
    # --- Pricing Feature ---
    # Controllers
    (r"import com\.example\.seatrans\.controller\.FeeConfigurationController;", "import com.example.seatrans.features.pricing.controller.FeeConfigurationController;"),
    (r"import com\.example\.seatrans\.controller\.PublicCalculatorController;", "import com.example.seatrans.features.pricing.controller.PublicCalculatorController;"),
    
    # Services
    (r"import com\.example\.seatrans\.service\.FeeConfigurationService;", "import com.example.seatrans.features.pricing.service.FeeConfigurationService;"),
    (r"import com\.example\.seatrans\.service\.pricing\.(.*);", r"import com.example.seatrans.features.pricing.service.\1;"), # Regex for sub-package

    # Repositories
    (r"import com\.example\.seatrans\.repository\.FeeConfigurationRepository;", "import com.example.seatrans.features.pricing.repository.FeeConfigurationRepository;"),
    (r"import com\.example\.seatrans\.repository\.PriceCalculationRepository;", "import com.example.seatrans.features.pricing.repository.PriceCalculationRepository;"),
    (r"import com\.example\.seatrans\.repository\.RateTableRepository;", "import com.example.seatrans.features.pricing.repository.RateTableRepository;"),
    (r"import com\.example\.seatrans\.repository\.SavedEstimateRepository;", "import com.example.seatrans.features.pricing.repository.SavedEstimateRepository;"),

    # Models
    (r"import com\.example\.seatrans\.entity\.PricingManagement\.FeeConfiguration;", "import com.example.seatrans.features.pricing.model.FeeConfiguration;"),
    (r"import com\.example\.seatrans\.entity\.PricingManagement\.FeeFormulaType;", "import com.example.seatrans.features.pricing.model.FeeFormulaType;"),
    (r"import com\.example\.seatrans\.entity\.PricingManagement\.FeeStatus;", "import com.example.seatrans.features.pricing.model.FeeStatus;"),
    (r"import com\.example\.seatrans\.entity\.PriceCalculation;", "import com.example.seatrans.features.pricing.model.PriceCalculation;"),
    (r"import com\.example\.seatrans\.entity\.RateTable;", "import com.example.seatrans.features.pricing.model.RateTable;"),
    (r"import com\.example\.seatrans\.entity\.SavedEstimate;", "import com.example.seatrans.features.pricing.model.SavedEstimate;"),

    # DTOs
    (r"import com\.example\.seatrans\.dto\.request\.CreateFeeConfigDTO;", "import com.example.seatrans.features.pricing.dto.CreateFeeConfigDTO;"),
    (r"import com\.example\.seatrans\.dto\.request\.UpdateFeeConfigDTO;", "import com.example.seatrans.features.pricing.dto.UpdateFeeConfigDTO;"),
    (r"import com\.example\.seatrans\.dto\.response\.FeeConfigResponseDTO;", "import com.example.seatrans.features.pricing.dto.FeeConfigResponseDTO;"),
    (r"import com\.example\.seatrans\.dto\.EstimateDTO;", "import com.example.seatrans.features.pricing.dto.EstimateDTO;"),
    (r"import com\.example\.seatrans\.dto\.CalculationStepDTO;", "import com.example.seatrans.features.pricing.dto.CalculationStepDTO;"),


    # --- Logistics Feature (Existing) ---
    # Models
    (r"import com\.example\.seatrans\.entity\.Order;", "import com.example.seatrans.features.logistics.model.Order;"),
    (r"import com\.example\.seatrans\.entity\.OrderItem;", "import com.example.seatrans.features.logistics.model.OrderItem;"),
    (r"import com\.example\.seatrans\.entity\.Port;", "import com.example.seatrans.features.logistics.model.Port;"),
    (r"import com\.example\.seatrans\.entity\.Province;", "import com.example.seatrans.features.logistics.model.Province;"),
    (r"import com\.example\.seatrans\.entity\.Quotation;", "import com.example.seatrans.features.logistics.model.Quotation;"),
    (r"import com\.example\.seatrans\.entity\.QuotationItem;", "import com.example.seatrans.features.logistics.model.QuotationItem;"),
    (r"import com\.example\.seatrans\.entity\.ServiceRequest;", "import com.example.seatrans.features.logistics.model.ServiceRequest;"),
    (r"import com\.example\.seatrans\.entity\.PricingManagement\.ServiceType;", "import com.example.seatrans.features.gallery.model.ServiceType;"), # Updated to Gallery
    (r"import com\.example\.seatrans\.entity\.ServiceTypeEntity;", "import com.example.seatrans.features.logistics.model.ServiceTypeEntity;"),
    
    # Repositories
    (r"import com\.example\.seatrans\.repository\.OrderRepository;", "import com.example.seatrans.features.logistics.repository.OrderRepository;"),
    (r"import com\.example\.seatrans\.repository\.OrderItemRepository;", "import com.example.seatrans.features.logistics.repository.OrderItemRepository;"),
    (r"import com\.example\.seatrans\.repository\.PortRepository;", "import com.example.seatrans.features.logistics.repository.PortRepository;"),
    (r"import com\.example\.seatrans\.repository\.ProvinceRepository;", "import com.example.seatrans.features.logistics.repository.ProvinceRepository;"),
    (r"import com\.example\.seatrans\.repository\.QuotationRepository;", "import com.example.seatrans.features.logistics.repository.QuotationRepository;"),
    (r"import com\.example\.seatrans\.repository\.QuotationItemRepository;", "import com.example.seatrans.features.logistics.repository.QuotationItemRepository;"),
    (r"import com\.example\.seatrans\.repository\.ServiceRequestRepository;", "import com.example.seatrans.features.logistics.repository.ServiceRequestRepository;"),
    (r"import com\.example\.seatrans\.repository\.ServiceTypeRepository;", "import com.example.seatrans.features.logistics.repository.ServiceTypeRepository;"),

    # Services
    (r"import com\.example\.seatrans\.service\.OrderService;", "import com.example.seatrans.features.logistics.service.OrderService;"),
    (r"import com\.example\.seatrans\.service\.PortService;", "import com.example.seatrans.features.logistics.service.PortService;"),
    (r"import com\.example\.seatrans\.service\.ProvinceService;", "import com.example.seatrans.features.logistics.service.ProvinceService;"),
    (r"import com\.example\.seatrans\.service\.QuotationService;", "import com.example.seatrans.features.logistics.service.QuotationService;"),
    (r"import com\.example\.seatrans\.service\.ServiceRequestService;", "import com.example.seatrans.features.logistics.service.ServiceRequestService;"),
    (r"import com\.example\.seatrans\.service\.ServiceTypeService;", "import com.example.seatrans.features.logistics.service.ServiceTypeService;"),

    # Controllers
    (r"import com\.example\.seatrans\.controller\.CustomerOrderController;", "import com.example.seatrans.features.logistics.controller.CustomerOrderController;"),
    (r"import com\.example\.seatrans\.controller\.CustomerRequestController;", "import com.example.seatrans.features.logistics.controller.CustomerRequestController;"),
    (r"import com\.example\.seatrans\.controller\.EmployeeQuotationController;", "import com.example.seatrans.features.logistics.controller.EmployeeQuotationController;"),
    (r"import com\.example\.seatrans\.controller\.PortController;", "import com.example.seatrans.features.logistics.controller.PortController;"),
    (r"import com\.example\.seatrans\.controller\.ProvinceController;", "import com.example.seatrans.features.logistics.controller.ProvinceController;"),
    (r"import com\.example\.seatrans\.controller\.ServiceTypeController;", "import com.example.seatrans.features.logistics.controller.ServiceTypeController;"),

    # DTOs
    (r"import com\.example\.seatrans\.dto\.OrderDTO;", "import com.example.seatrans.features.logistics.dto.OrderDTO;"),
    (r"import com\.example\.seatrans\.dto\.PortDTO;", "import com.example.seatrans.features.logistics.dto.PortDTO;"),
    (r"import com\.example\.seatrans\.dto\.ProvinceDTO;", "import com.example.seatrans.features.logistics.dto.ProvinceDTO;"),
    (r"import com\.example\.seatrans\.dto\.QuotationDTO;", "import com.example.seatrans.features.logistics.dto.QuotationDTO;"),
    (r"import com\.example\.seatrans\.dto\.QuotationInternalDTO;", "import com.example.seatrans.features.logistics.dto.QuotationInternalDTO;"),
    (r"import com\.example\.seatrans\.dto\.QuotationItemDTO;", "import com.example.seatrans.features.logistics.dto.QuotationItemDTO;"),
    (r"import com\.example\.seatrans\.dto\.ServiceRequestDTO;", "import com.example.seatrans.features.logistics.dto.ServiceRequestDTO;"),
    (r"import com\.example\.seatrans\.dto\.ServiceTypeDTO;", "import com.example.seatrans.features.logistics.dto.ServiceTypeDTO;"),
    (r"import com\.example\.seatrans\.dto\.request\.CharteringRequestDTO;", "import com.example.seatrans.features.logistics.dto.CharteringRequestDTO;"),
    (r"import com\.example\.seatrans\.dto\.request\.CreatePortRequest;", "import com.example.seatrans.features.logistics.dto.CreatePortRequest;"),
    (r"import com\.example\.seatrans\.dto\.request\.CreateProvinceRequest;", "import com.example.seatrans.features.logistics.dto.CreateProvinceRequest;"),
    (r"import com\.example\.seatrans\.dto\.request\.CreateServiceTypeRequest;", "import com.example.seatrans.features.logistics.dto.CreateServiceTypeRequest;"),
    (r"import com\.example\.seatrans\.dto\.request\.LogisticsRequestDTO;", "import com.example.seatrans.features.logistics.dto.LogisticsRequestDTO;"),
    (r"import com\.example\.seatrans\.dto\.request\.ShippingAgencyRequestDTO;", "import com.example.seatrans.features.logistics.dto.ShippingAgencyRequestDTO;"),

    # Wildcards (Be careful with these)
    (r"import com\.example\.seatrans\.entity\.\*;", "import com.example.seatrans.features.logistics.model.*;"),
    (r"import com\.example\.seatrans\.repository\.\*;", "import com.example.seatrans.features.logistics.repository.*;"),
    (r"import com\.example\.seatrans\.service\.\*;", "import com.example.seatrans.features.logistics.service.*;"),
    (r"import com\.example\.seatrans\.dto\.\*;", "import com.example.seatrans.features.logistics.dto.*;"),
]

for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".java"):
            filepath = os.path.join(subdir, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for pattern, replacement in mappings:
                new_content = re.sub(pattern, replacement, new_content)
            
            if new_content != content:
                print(f"Updating {filepath}")
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
