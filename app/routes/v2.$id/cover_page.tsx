import { BuildingOffice2Icon } from "@heroicons/react/24/outline"
import { MetaData} from "./schemas"

export const CoverPage = ({metadata, orgName}:{metadata:MetaData,orgName:string})=>{
    const completion_date = new Date(metadata.completion_date||"").toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})
    const subtle_date = new Date(metadata.completion_date||"").toLocaleDateString('en-US',{month:'long',year:'numeric'})
    return(
        <div
        className="h-screen w-full flex flex-col justify-center items-center text-xenter p-12 bg-slate-900 text-white"
        style={{
            backgroundImage:"url('/assets/reportAssets/image.png')",
            backgroundSize : 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay'
        }}
        >
            <div className="absolute top-8 left-8 text-left">
                {/* Here we need company logo assets from company profile db */}
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                    <BuildingOffice2Icon className="w-6 h-6 text-white"/>
                </div>
                <p className="font-semibold text-lg">{orgName|| 'Placeholder Company Inc.'}</p>
            </div>
            
            <div className="flex-grow flex flex-col justify-center items-center">
                 <h1 className="text-5xl font-extrabold tracking-tight" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                     Digital Maturity Assessment Report
                 </h1>
                 <h2 className="text-2xl font-light mt-4 text-gray-200">
                     Comprehensive Diagnostic Report – {subtle_date}
                 </h2>
                 <p className="mt-8 font-mono text-lg py-2 px-4 border border-white/30 rounded-md">
                     Assessment ID: {metadata.assessment_id}
                 </p>
            </div>

            <div className="absolute bottom-8 text-center w-full text-sm">
                <p className="text-gray-300">Date of Completion: {completion_date}</p>
                <p className="text-gray-400 mt-1">Powered by Delosh</p>
            </div>
        </div>
    )
}