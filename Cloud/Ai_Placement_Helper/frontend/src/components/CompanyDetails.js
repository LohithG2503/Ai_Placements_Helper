import React from "react";

function CompanyDetails({ companyInsights }) {
  if (!companyInsights) {
    return <p className="p-6">No company details available. Please analyze a job description first.</p>;
  }

  const {
    name,
    description,
    additionalInfo = {},
    culture = {},
    careerGrowth = {},
    interviewPrep = {}
  } = companyInsights;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Company Overview */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Company Overview</h2>
        <p className="text-xl font-semibold mb-2">{name}</p>
        
        {description && (
          <div className="mb-6">
            <p className="text-gray-700 text-lg">{description}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <DataItem label="Industry " value={additionalInfo.industry} />
          <DataItem label="Founded " value={additionalInfo.founded} />
          <DataItem label="Headquarters " value={additionalInfo.headquarters} />
          <DataItem label="Size " value={additionalInfo.sizeRange} />
          <DataItem 
            label="Current Employees" 
            value={additionalInfo.employeeCount}
          />
          <DataItem 
            label="Total Employees" 
            value={additionalInfo.totalEmployees}
          />
        </div>
      </section>

      {/* Company Culture */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Company Culture</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Core Values</h3>
            <ul className="list-disc pl-5 mt-2">
              {culture.values?.map((value, index) => (
                <li key={index}>{value}</li>
              )) || <li>No values listed</li>}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Benefits</h3>
            <ul className="list-disc pl-5 mt-2">
              {culture.benefits?.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              )) || <li>No benefits listed</li>}
            </ul>
          </div>
        </div>
      </section>

      {/* Interview Preparation */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Interview Preparation</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Interview Process</h3>
            <ol className="list-decimal pl-5 mt-2">
              {interviewPrep.process?.map((step, index) => (
                <li key={index}>{step}</li>
              )) || <li>No interview process information available</li>}
            </ol>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Tips for Success</h3>
            <ul className="list-disc pl-5 mt-2">
              {interviewPrep.tipsAndTricks?.map((tip, index) => (
                <li key={index}>{tip}</li>
              )) || <li>No tips available</li>}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

const DataItem = ({ label, value }) => (
  value ? (
    <div className="flex flex-col">
      <span className="font-semibold text-gray-600">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  ) : null
);

export default CompanyDetails;