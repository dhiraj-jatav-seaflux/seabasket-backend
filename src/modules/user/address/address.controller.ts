import { TRequest, TResponse } from "@types";
import { TAddressDTO } from "../dtos";
import { NextFunction } from "express";
import { getRepo } from "@helpers";
import { AddressesEntity } from "db/entities/addresses.entity";

export async function addAddress(req:TRequest<TAddressDTO>,res:TResponse,next:NextFunction){
  try {
    const {id} = req.me;
    const {address,city,pincode,state} = req.dto
    const addRepo = getRepo(AddressesEntity);

    const newAddress = addRepo.create({
      user_id:id,
      address,
      city,
      pincode,
      state
    });

    await addRepo.save(newAddress);

    return res.status(201).json({message:'Address created successfully',add:newAddress});
  } catch (error) {
    next(Error);
  }
}

export async function updateAddress(req:TRequest<TAddressDTO>,res:TResponse,next:NextFunction){
  try {
    const {id} = req.me;
    const addressId = Number(req.params.addressId);

    const {address,city,pincode,state} = req.dto

    if(!addressId){
      return res.status(400).json({message:'Invalid request'});
    }

    const addRepo = getRepo(AddressesEntity);

    const updatingAddress = await addRepo.findOne({
      where:{user_id:id,id:addressId}
    })

    if(!updatingAddress){
      return res.status(404).json({message:'Address not found'});
    }

    updatingAddress.address = address;
    updatingAddress.city = city;
    updatingAddress.pincode = pincode;
    updatingAddress.state = state;

    await addRepo.save(updatingAddress);

    return res.status(200).json({message:'Address updated successfully'})
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(
  req: TRequest,
  res: TResponse,
  next: NextFunction
) {
  try {
    const { id } = req.me;
    const addressId = Number(req.params.addressId);

    const addRepo = getRepo(AddressesEntity);

    const totalAddresses = await addRepo.count({
      where: { user_id: id },
    });

    if (totalAddresses <= 1) {
      return res.status(400).json({
        message: "You must have at least one address",
      });
    }

    const address = await addRepo.findOne({
      where: { id: addressId, user_id: id },
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    await addRepo.delete(addressId);

    return res
      .status(200)
      .json({ message: "Address deleted successfully" });
  } catch (error) {
    next(error);
  }
}