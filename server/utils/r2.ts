export const buildPublicUrl = (publicUrl: string, path: string | null) => {
	if (!path) return null;
	if (path.startsWith("http://") || path.startsWith("https://")) return path;
	const base = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
	const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
	return `${base}/${normalizedPath}`;
};

export const stripPublicUrl = (publicUrl: string, value: string | null) => {
	if (!value) return null;
	if (!value.startsWith("http://") && !value.startsWith("https://")) {
		return value.startsWith("/") ? value.slice(1) : value;
	}
	const base = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
	if (!value.startsWith(base)) return null;
	const path = value.slice(base.length);
	const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
	return normalizedPath.length > 0 ? normalizedPath : null;
};
