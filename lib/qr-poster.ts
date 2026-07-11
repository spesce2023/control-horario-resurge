import "server-only";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { qrPayload } from "./qr";

const OLIVE = rgb(0x5c / 255, 0x4e / 255, 0x33 / 255);
const SECONDARY = rgb(0x8a / 255, 0x7f / 255, 0x6a / 255);
const BORDER = rgb(0xe4 / 255, 0xda / 255, 0xcb / 255);

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

async function qrPngBuffer(payload: string, size: number): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    margin: 1,
    width: size,
    color: { dark: "#5C4E33", light: "#FFFFFF" },
  });
}

function drawCenteredText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  size: number,
  y: number,
  color = OLIVE
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (A4_WIDTH - width) / 2, y, size, font, color });
}

/**
 * Cartel A4 listo para imprimir y pegar en el local: QR grande para marcar
 * entrada/salida (RF-18) + un QR chico en la esquina que lleva directo al
 * login de la app, para el empleado que no recuerda la URL.
 */
export async function buildQrPosterPdf(params: {
  markToken: string;
  appUrl: string;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);

  const fontBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  drawCenteredText(page, fontBold, "Reloj Re·Surge", 34, A4_HEIGHT - 100);
  drawCenteredText(
    page,
    fontItalic,
    "té, café y encuentros que inspiran",
    12,
    A4_HEIGHT - 128,
    SECONDARY
  );

  drawCenteredText(
    page,
    fontRegular,
    "Escaneá este código con la cámara de tu celular",
    14,
    A4_HEIGHT - 178
  );
  drawCenteredText(page, fontRegular, "para marcar tu entrada o salida", 14, A4_HEIGHT - 197);

  const mainQrSize = 340;
  const mainQrBuffer = await qrPngBuffer(qrPayload(params.markToken), mainQrSize);
  const mainQrImage = await pdf.embedPng(mainQrBuffer);
  const mainQrX = (A4_WIDTH - mainQrSize) / 2;
  const mainQrY = A4_HEIGHT - 225 - mainQrSize;

  page.drawRectangle({
    x: mainQrX - 16,
    y: mainQrY - 16,
    width: mainQrSize + 32,
    height: mainQrSize + 32,
    borderColor: BORDER,
    borderWidth: 1.5,
  });
  page.drawImage(mainQrImage, { x: mainQrX, y: mainQrY, width: mainQrSize, height: mainQrSize });

  drawCenteredText(
    page,
    fontItalic,
    "Este código se invalida si el dueño lo regenera — no lo fotocopies ni lo repliques.",
    9,
    mainQrY - 34,
    SECONDARY
  );

  // QR chico de acceso a la app, esquina inferior derecha.
  const smallQrSize = 84;
  const smallQrBuffer = await qrPngBuffer(`${params.appUrl}/login`, smallQrSize);
  const smallQrImage = await pdf.embedPng(smallQrBuffer);
  const cornerMargin = 46;
  const smallQrX = A4_WIDTH - cornerMargin - smallQrSize;
  const smallQrY = cornerMargin;

  const captionSize = 8.5;
  const caption = "Accedé a la app";
  const captionWidth = fontRegular.widthOfTextAtSize(caption, captionSize);
  page.drawText(caption, {
    x: smallQrX + (smallQrSize - captionWidth) / 2,
    y: smallQrY + smallQrSize + 6,
    size: captionSize,
    font: fontRegular,
    color: OLIVE,
  });

  page.drawImage(smallQrImage, { x: smallQrX, y: smallQrY, width: smallQrSize, height: smallQrSize });

  const hostLabel = new URL(params.appUrl).host;
  const hostWidth = fontItalic.widthOfTextAtSize(hostLabel, 8);
  page.drawText(hostLabel, {
    x: smallQrX + (smallQrSize - hostWidth) / 2,
    y: smallQrY - 12,
    size: 8,
    font: fontItalic,
    color: SECONDARY,
  });

  return pdf.save();
}
