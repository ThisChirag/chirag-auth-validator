import { Response } from "express";


export const validateFields = (fields: { [key: string]: any }, res: Response) => {

    const allValues: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(fields)) {
        if (!value) {
            allValues[key] = value; 
        }
    }
    if (Object.keys(allValues).length > 0) {
        res.status(400).json({ msg: `${Object.keys(allValues).join(", ")} cannot be empty` });
        return false; 
    }


    return true;
};
