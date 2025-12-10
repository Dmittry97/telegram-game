import crypto from "crypto";

type ParsedInitData = {
  user?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
    allows_write_to_pm?: boolean;
  };
  auth_date?: number;
  hash?: string;
  [key: string]: any;
};

const createCheckString = (data: URLSearchParams) => {
  const pairs: string[] = [];
  data.forEach((value, key) => {
    if (key === "hash") return;
    pairs.push(`${key}=${value}`);
  });
  return pairs.sort().join("\n");
};

const getSecretKey = (token: string) =>
  crypto.createHmac("sha256", "WebAppData").update(token).digest();

const getBotToken = () => {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    throw new Error("BOT_TOKEN не задан в переменных окружения");
  }
  return token;
};

export function verifyInitData(initData: string): ParsedInitData {
  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  if (!receivedHash) {
    throw new Error("hash не найден в initData");
  }

  const checkString = createCheckString(params);
  const secretKey = getSecretKey(getBotToken());
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  if (computedHash !== receivedHash) {
    throw new Error("Некорректная подпись initData");
  }

  const parsed: ParsedInitData = {};
  params.forEach((value, key) => {
    if (key === "user") {
      parsed.user = JSON.parse(value);
    } else if (key === "auth_date") {
      parsed.auth_date = Number(value);
    } else if (key === "hash") {
      parsed.hash = value;
    } else {
      parsed[key] = value;
    }
  });

  return parsed;
}

