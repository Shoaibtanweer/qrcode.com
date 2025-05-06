# QR Code Generator Website

A feature-rich QR code generator website built with Node.js, Express, and vanilla JavaScript. Allows users to generate QR codes for numbers, text, links, PDFs, and images.

Developed by Shoaib Tanweer.

## Features

* Generate QR Codes for:
    * Numbers
    * Text
    * Links/URLs
    * PDF Files (Generates a QR code linking to the uploaded PDF)
    * Image Files (Generates a QR code linking to the uploaded image)
* Homepage with tool selection (Hexagon/Rectangle layout).
* Individual tool pages for generation.
* Dark Mode Toggle (saves preference in localStorage).
* File upload handling for PDF and Images.
* Basic QR Code preview.
* Download QR Code as PNG,JPG,SVG.
* Responsive design for Desktop and Mobile.
* Basic backend structure using Node.js and Express.

## Planned Features / TODO

* Advanced QR Customization (Colors, Background, Logo upload, Logo size).
* "Scan Me" and other overlay templates.
* Input validation (URL format, number format).
* User Login/Accounts (for saving QR codes).
* Language switching implementation.
* More robust error handling.
* Refactor frontend to use components/templating for Header/Footer (DRY).
* Optimize file serving for production (e.g., use cloud storage like S3).
* Implement SVG generation on backend/frontend.
* Implement JPG conversion (likely using Canvas API on frontend or a library on backend).

## Project Structure