
import { z } from 'zod'
export interface Engine {
    pk: string//"ENGINE#company_id",
    sk: string//"engine_name#version",
    engine_id: string//"uuid",
    engine_name: string,
    version: string//"1.0", // semantic versioning
    status: string//"draft | published | archived",
    price: number,
    currency: string,
    created_by: string//"user_id",
    created_at: "timestamp",
    updated_by: "user_id",
    updated_at: "timestamp",
    is_latest: boolean // for easy querying of latest version
}

export const EngineValidation = z.object({
    company_id: z.string().uuid(),
    // engine_id: z.string().uuid(),
    user_id: z.string().uuid(),
    engine_name: z.string().trim().min(1).refine(
        (val) => {
            if (val === "HCM Vendor Fit Engine" || val === "HR Transformation Roadmap Generator" || val === "Shared Service Designer" || val === "Intelligent Change Management" || val === "HR Technology Maturity Analysis") {
                return true
            }
            else
                return false
        },
        {
            message: "Invalid engine_name",
        }
    ),
    // version:z.string().trim().min(1),
    // usage_status: z.string().trim().min(1).refine(
    //     (val)=>{
    //         if(val==="Draft"||val ==="In Process"||val==="Completed"){
    //             return true
    //         }
    //         else
    //             return false
    //     },
    //     {
    //         message: "Invalid engine_name",
    //     }
    // ),
    progress: z.number(),
    responses: z.any().optional(),
    country: z.string().trim().min(1),
    // created_by:z.string().uuid(),// we have userid
    // updated_by : z.string().uuid().optional()
})