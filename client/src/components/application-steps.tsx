import { UserPen, Upload, Banknote } from "lucide-react";

export default function ApplicationSteps() {
  const steps = [
    {
      icon: UserPen,
      title: "Fill Application",
      description: "Complete our simple online form with your personal and financial details. Takes less than 5 minutes.",
      color: "primary"
    },
    {
      icon: Upload,
      title: "Upload Documents",
      description: "Upload required documents including ID proof, income proof, and bank statements securely.",
      color: "secondary"
    },
    {
      icon: Banknote,
      title: "Get Funds",
      description: "Once approved, receive funds directly in your bank account within 24 hours.",
      color: "accent"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-poppins font-bold text-text mb-4">
            Simple 3-Step Process
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get your personal loan approved in just three easy steps. Our streamlined process ensures quick and hassle-free experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors
                  ${step.color === 'primary' ? 'bg-primary/10 group-hover:bg-primary/20' : ''}
                  ${step.color === 'secondary' ? 'bg-secondary/10 group-hover:bg-secondary/20' : ''}
                  ${step.color === 'accent' ? 'bg-accent/10 group-hover:bg-accent/20' : ''}
                `}>
                  <Icon className={`w-8 h-8 
                    ${step.color === 'primary' ? 'text-primary' : ''}
                    ${step.color === 'secondary' ? 'text-secondary' : ''}
                    ${step.color === 'accent' ? 'text-accent' : ''}
                  `} />
                </div>
                <h3 className="text-xl font-poppins font-semibold text-text mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
