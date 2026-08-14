# Sari-SaaS Research Document

This folder contains the editable LaTeX source for the formal Sari-SaaS
developmental research manuscript.

## Edit in TeXstudio

1. Open `main.tex` in TeXstudio.
2. Replace the author, institution, department, degree, adviser, and submission
   placeholders near the top of the file.
3. Select `PdfLaTeX` as the compiler and `Biber` as the bibliography tool.
4. Build the document. A complete manual build sequence is:

```text
pdflatex main.tex
biber main
pdflatex main.tex
pdflatex main.tex
```

The citations and reference list use the `biblatex-apa` package with Biber.
TeXstudio may ask MiKTeX for permission to install a missing package on the
first build.

## Research integrity note

The manuscript reports current prototype verification but deliberately does not
invent merchant survey or usability results. Complete the proposed evaluation,
then replace the future-tense methodology and acceptance criteria with approved
participant details, analysis, findings, and institutional ethics information.
