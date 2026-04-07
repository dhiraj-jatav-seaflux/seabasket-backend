import { withRoutes } from "@helpers";
import { acl, bodyValidator } from "@middlewares";
import { Router } from "express";
import { AddressDTO } from "../dtos";
import { addAddress, deleteAddress, updateAddress } from "./address.controller";


const routes = (app:Router)=>{
    app.post('/',acl,bodyValidator(AddressDTO),addAddress)
    app.put('/:addressId',acl,bodyValidator(AddressDTO),updateAddress);
    app.delete('/:addressId',acl,deleteAddress);
}

export const addressRoutes = withRoutes(routes);