package com.storage.warehouse.mapper;

import com.storage.warehouse.document.Product;
import com.storage.warehouse.dto.NewProductDTO;
import com.storage.warehouse.dto.ProductDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedSourcePolicy = ReportingPolicy.IGNORE, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductMapper {

  @Mapping(target = "createdAt", ignore = true)
  Product newProductToEntity(NewProductDTO newProductDTO);

    ProductDTO productToDTO(Product product);
}
