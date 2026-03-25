
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
            const validEngines = [
                "HCM Vendor Fit Engine", 
                "HR Transformation Roadmap Generator", 
                "Shared Service Designer", 
                "Intelligent Change Management", 
                "HR Technology Maturity Analysis",
                "AI Driven Maturity Engine",
                "HR Tech Maturity",
                "Profiling Assessment",
                "Change Management Readiness",
                "Digital Maturity Assessment",
                "Enterprise Architecture"
            ];
            // Just return true for now to allow any valid string or check against expanded list
            return true;
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