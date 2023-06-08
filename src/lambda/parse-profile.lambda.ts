export interface CandidateProfile {
    name: string;
    email: string;
    experience: CandidateExperience[];
    certifications: CandidateCertifications[];
    spokenLanguages: string[];
}

export interface CandidateExperience {
    technology: string;
    years: number;
    description?: string;
}

export interface CandidateCertifications {
    name: string;
    year: number;
    description?: string;
    domain: string;
}

export const handler = async (event: { payload: CandidateProfile }) => {
    console.log(event);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello World!"
        })
    }
}