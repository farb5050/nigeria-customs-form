"use client"

import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export async function generatePDF() {
  // Create a new jsPDF instance
  const pdf = new jsPDF("p", "mm", "a4")
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  try {
    // Get the form elements - we need to find them by their tab content IDs
    const page1Element = document.querySelector('[data-state="active"][role="tabpanel"][id^="radix-"]')
    const page2Element = document.querySelector('[data-state="active"][role="tabpanel"][id^="radix-"]')

    if (!page1Element) {
      console.error("Form page 1 not found")
      return
    }

    // Generate canvas from page 1
    const page1Canvas = await html2canvas(page1Element as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: 1200, // Set a fixed width for consistent rendering
      onclone: (document, element) => {
        // Hide buttons and other non-printable elements in the clone
        const nonPrintableElements = element.querySelectorAll('button:not([type="submit"]), [data-non-printable]')
        nonPrintableElements.forEach((el) => {
          ;(el as HTMLElement).style.display = "none"
        })
      },
    })

    // Add page 1 to PDF
    const page1ImgData = page1Canvas.toDataURL("image/png")
    pdf.addImage(page1ImgData, "PNG", 10, 10, pageWidth - 20, 0, undefined, "FAST")

    // Switch to page 2 tab
    const page2Tab = document.querySelector('[role="tab"][data-state="inactive"]') as HTMLElement
    if (page2Tab) {
      page2Tab.click()

      // Wait for tab content to be visible
      await new Promise((resolve) => setTimeout(resolve, 100))

      const page2Element = document.querySelector('[data-state="active"][role="tabpanel"][id^="radix-"]')

      if (page2Element) {
        // Add a new page for page 2
        pdf.addPage()

        // Generate canvas from page 2
        const page2Canvas = await html2canvas(page2Element as HTMLElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          windowWidth: 1200,
          onclone: (document, element) => {
            const nonPrintableElements = element.querySelectorAll('button:not([type="submit"]), [data-non-printable]')
            nonPrintableElements.forEach((el) => {
              ;(el as HTMLElement).style.display = "none"
            })
          },
        })

        // Add page 2 to PDF
        const page2ImgData = page2Canvas.toDataURL("image/png")
        pdf.addImage(page2ImgData, "PNG", 10, 10, pageWidth - 20, 0, undefined, "FAST")
      }
    }

    // Save the PDF
    pdf.save("Nigeria_Customs_Certificate_of_Origin.pdf")

    // Switch back to page 1
    const page1Tab = document.querySelector('[role="tab"][data-state="inactive"]') as HTMLElement
    if (page1Tab) {
      page1Tab.click()
    }
  } catch (error) {
    console.error("Error generating PDF:", error)
    alert("There was an error generating the PDF. Please try again.")
  }
}
