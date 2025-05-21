"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Printer, Save } from "lucide-react"
import FormPage1 from "@/components/form-page-1"
import FormPage2 from "@/components/form-page-2"
import { FormProvider } from "@/components/form-provider"
import Image from "next/image"
import { generatePDF } from "@/lib/pdf-generator"
import { loadFormProgress } from "@/lib/form-storage"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from 'next/navigation';

export default function Home() {
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("page1")

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      toast({
        title: 'Submission Successful',
        description: 'Your form has been submitted.',
      });
      form.reset();
      setActiveTab('page1');
      // optionally navigate to dashboard or refresh
      // router.push('/dashboard');
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting the form.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    // Check for saved form data on component mount
    const { savedAt } = loadFormProgress()
    if (savedAt) {
      setLastSaved(savedAt)
    }
  }, [])

  const handleSaveProgress = () => {
    try {
      // We'll access the form context from within the FormProvider
      const formContext = document.getElementById("form-context-accessor")
      if (formContext) {
        const event = new CustomEvent("save-form-progress")
        formContext.dispatchEvent(event)

        // Update last saved time
        setLastSaved(new Date().toISOString())

        toast({
          title: "Progress Saved",
          description: "Your form progress has been saved successfully.",
        })
      }
    } catch (error) {
      console.error("Error saving form progress:", error)
      toast({
        title: "Save Failed",
        description: "There was an error saving your progress.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPDF = async () => {
    try {
      await generatePDF()
      toast({
        title: "PDF Generated",
        description: "Your PDF has been generated and downloaded.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your PDF.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#1a5276] text-white py-4 px-6 shadow-md">
        <div className="container mx-auto flex flex-col items-center">
          <div className="mb-2">
            <Image
              src="/images/nigeria-customs-logo.png"
              alt="Nigeria Customs Service Logo"
              width={100}
              height={100}
              className="bg-white rounded-full p-1"
            />
          </div>
          <h1 className="text-2xl font-bold text-center">NIGERIA CUSTOMS SERVICE</h1>
          <h2 className="text-xl text-center">Certificate of Origin Request Form</h2>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-md">
          <h3 className="font-bold text-lg mb-2">Form Instructions</h3>
          <p className="mb-2">This digital form allows you to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Complete all required fields</li>
            <li>Save your progress</li>
            <li>Generate a PDF for printing or submission</li>
            <li>Submit electronically with attachments</li>
          </ul>
          <p className="mt-2 text-sm italic">Required fields are marked with an asterisk (*)</p>
        </div>

        <div className="flex justify-end gap-4 mb-6">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleSaveProgress}>
            <Save size={16} />
            Save Progress
            {lastSaved && (
              <span className="text-xs text-gray-500 ml-2">Last saved: {new Date(lastSaved).toLocaleString()}</span>
            )}
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadPDF}>
            <Download size={16} />
            Download PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => window.print()}>
            <Printer size={16} />
            Print Form
          </Button>
        </div>

        <div className="bg-white border rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <FormProvider>
              <Tabs defaultValue="page1" className="w-full" onValueChange={setActiveTab} value={activeTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="page1">Page 1: Exporter & Product Details</TabsTrigger>
                  <TabsTrigger value="page2">Page 2: Materials & Declaration</TabsTrigger>
                </TabsList>
                <TabsContent value="page1" className="p-6">
                  <FormPage1 />
                  <div className="flex justify-end mt-8">
                    <Button onClick={() => setActiveTab("page2")} className="bg-[#1a5276] hover:bg-[#154360]">
                      Next: Materials & Declaration
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="page2" className="p-6">
                  <FormPage2 />
                  <div className="flex justify-end mt-8">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Submit
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </FormProvider>
          </form>
        </div>
      </main>

      <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm mt-8">
        <p>© {new Date().getFullYear()} Nigeria Customs Service. All rights reserved.</p>
        <p className="mt-1">
          For assistance, contact:{" "}
          <a href="mailto:nafiu.isiyaku@customs.gov.ng" className="text-blue-600 hover:underline">
            nafiu.isiyaku@customs.gov.ng
          </a>
        </p>
      </footer>
      <Toaster />
    </div>
  )
}
