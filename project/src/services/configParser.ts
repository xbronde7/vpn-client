import { v4 as uuidv4 } from 'uuid';
import { ServerConfig, Protocol } from '../types';

export function parseVmessLink(link: string): ServerConfig | null {
  try {
    if (!link.startsWith('vmess://')) return null;
    const b64 = link.slice(8);
    const jsonStr = atob(b64);
    const data = JSON.parse(jsonStr);
    
    return {
      id: uuidv4(),
      name: data.ps || 'VMess Server',
      protocol: 'vmess',
      server: data.add,
      port: parseInt(data.port, 10),
      uuid: data.id,
      alterId: parseInt(data.aid || '0', 10),
      security: data.scy || data.tls || 'auto',
      network: data.net || 'tcp',
      path: data.path || '',
      host: data.host || data.sni || '',
      sni: data.sni || '',
      remark: data.ps || '',
      createdAt: Date.now(),
      isActive: false,
    };
  } catch {
    return null;
  }
}

export function parseVlessLink(link: string): ServerConfig | null {
  try {
    if (!link.startsWith('vless://')) return null;
    
    // Handle fragment #name
    const hashIdx = link.indexOf('#');
    let fragmentName = '';
    let cleanLink = link;
    if (hashIdx !== -1) {
      fragmentName = decodeURIComponent(link.slice(hashIdx + 1));
      cleanLink = link.slice(0, hashIdx);
    }
    
    const url = new URL(cleanLink);
    const params = url.searchParams;
    
    // Parse uuid from url.username (before @)
    const uuid = url.username || '';
    if (!uuid || uuid.length < 36) {
      // Try parsing without URL to handle edge cases
      const match = cleanLink.match(/vless:\/\/([^@]+)@(.+):(\d+)(\?.*)?/);
      if (match) {
        const manualUuid = match[1];
        const manualServer = match[2];
        const manualPort = parseInt(match[3], 10);
        const manualParams = new URLSearchParams(match[4]?.slice(1) || '');
        
        const host = manualParams.get('host') || '';
        const sni = manualParams.get('sni') || host || '';
        
        return {
          id: uuidv4(),
          name: fragmentName || manualParams.get('remark') || manualParams.get('name') || 'VLESS Server',
          protocol: 'vless',
          server: manualServer,
          port: manualPort,
          uuid: manualUuid,
          security: manualParams.get('security') || manualParams.get('tls') || '',
          network: manualParams.get('type') || manualParams.get('network') || 'tcp',
          path: manualParams.get('path') || '',
          host: host,
          sni: sni,
          remark: fragmentName || manualParams.get('remark') || '',
          createdAt: Date.now(),
          isActive: false,
          pbk: manualParams.get('pbk') || undefined,
          sid: manualParams.get('sid') || undefined,
          fp: manualParams.get('fp') || undefined,
          spiderX: manualParams.get('spx') || manualParams.get('spiderX') || undefined,
          flow: manualParams.get('flow') || undefined,
          headerType: manualParams.get('headerType') || undefined,
          encryption: manualParams.get('encryption') || undefined,
        };
      }
      return null;
    }
    
    const host = params.get('host') || '';
    const sni = params.get('sni') || host || '';
    
    return {
      id: uuidv4(),
      name: fragmentName || params.get('remark') || params.get('name') || 'VLESS Server',
      protocol: 'vless',
      server: url.hostname,
      port: parseInt(url.port, 10) || 443,
      uuid: uuid,
      security: params.get('security') || params.get('tls') || '',
      network: params.get('type') || params.get('network') || 'tcp',
      path: params.get('path') || '',
      host: host,
      sni: sni,
      remark: fragmentName || params.get('remark') || '',
      createdAt: Date.now(),
      isActive: false,
      pbk: params.get('pbk') || undefined,
      sid: params.get('sid') || undefined,
      fp: params.get('fp') || undefined,
      spiderX: params.get('spx') || params.get('spiderX') || undefined,
      flow: params.get('flow') || undefined,
      headerType: params.get('headerType') || undefined,
      encryption: params.get('encryption') || undefined,
    };
  } catch (e) {
    console.warn('VLESS parse error:', e);
    return null;
  }
}

export function parseSsLink(link: string): ServerConfig | null {
  try {
    if (!link.startsWith('ss://')) return null;
    
    let rest = link.slice(5);
    let method = '';
    let password = '';
    let server = '';
    let port = 8388;
    let name = 'Shadowsocks Server';
    
    if (rest.includes('#')) {
      const parts = rest.split('#');
      rest = parts[0];
      name = decodeURIComponent(parts[1]);
    }
    
    if (rest.includes('@')) {
      const [auth, serverPart] = rest.split('@');
      const decoded = atob(auth);
      [method, password] = decoded.split(':');
      const [srv, prt] = serverPart.split(':');
      server = srv;
      port = parseInt(prt, 10);
    } else {
      const decoded = atob(rest);
      const match = decoded.match(/^(.+):(.+)@(.+):(\d+)$/);
      if (match) {
        method = match[1];
        password = match[2];
        server = match[3];
        port = parseInt(match[4], 10);
      }
    }
    
    return {
      id: uuidv4(),
      name,
      protocol: 'shadowsocks',
      server,
      port,
      password,
      method,
      createdAt: Date.now(),
      isActive: false,
    };
  } catch {
    return null;
  }
}

export function parseTrojanLink(link: string): ServerConfig | null {
  try {
    if (!link.startsWith('trojan://')) return null;
    const url = new URL(link);
    const params = url.searchParams;
    
    const host = params.get('host') || '';
    const sni = params.get('sni') || host || url.hostname;
    
    return {
      id: uuidv4(),
      name: params.get('remark') || params.get('name') || 'Trojan Server',
      protocol: 'trojan',
      server: url.hostname,
      port: parseInt(url.port, 10) || 443,
      password: url.username || url.pathname.slice(1),
      security: 'tls',
      network: params.get('type') || 'tcp',
      path: params.get('path') || '',
      host: host,
      sni: sni,
      remark: params.get('remark') || '',
      createdAt: Date.now(),
      isActive: false,
    };
  } catch {
    return null;
  }
}

export function parseAnyLink(link: string): ServerConfig | null {
  if (link.startsWith('vmess://')) return parseVmessLink(link);
  if (link.startsWith('vless://')) return parseVlessLink(link);
  if (link.startsWith('ss://')) return parseSsLink(link);
  if (link.startsWith('trojan://')) return parseTrojanLink(link);
  return null;
}

/**
 * Parse a subscription URL content.
 * Subscriptions can be:
 * - Base64 encoded list of links
 * - Plain text list of links
 * - JSON format (some providers)
 */
export function parseSubscriptionContent(content: string, subscriptionUrl?: string): ServerConfig[] {
  const configs: ServerConfig[] = [];
  let decoded = content.trim();
  
  // Try base64 decode first (most common)
  try {
    decoded = atob(decoded);
  } catch {
    // Not base64, use as-is
  }
  
  // Some subscriptions have HTML or other wrappers - try to extract just base64
  if (decoded.includes('<') && decoded.includes('>')) {
    const base64Match = decoded.match(/[A-Za-z0-9+/]{40,}={0,2}/);
    if (base64Match) {
      try {
        decoded = atob(base64Match[0]);
      } catch {
        // keep decoded as-is
      }
    }
  }
  
  // Split by lines and parse each link
  const lines = decoded.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  for (const line of lines) {
    const config = parseAnyLink(line);
    if (config) {
      configs.push(config);
      continue;
    }
    
    // Some providers use vmess:// links not properly base64-encoded, mixed in one line
    const protocolPattern = /(vmess:\/\/[^\s]+|vless:\/\/[^\s]+|ss:\/\/[^\s]+|trojan:\/\/[^\s]+)/g;
    let match;
    while ((match = protocolPattern.exec(line)) !== null) {
      const subConfig = parseAnyLink(match[0]);
      if (subConfig) {
        configs.push(subConfig);
      }
    }
  }
  
  return configs;
}

/**
 * Fetch subscription from URL.
 * Returns array of configs or null on error.
 */
export async function fetchSubscription(url: string): Promise<ServerConfig[] | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'v2rayNG/1.8.5',
        'Accept': '*/*',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const content = await response.text();
    return parseSubscriptionContent(content, url);
  } catch (error) {
    console.error('Failed to fetch subscription:', error);
    return null;
  }
}

export function configToLink(config: ServerConfig): string {
  switch (config.protocol) {
    case 'vmess': {
      const obj = {
        v: '2',
        ps: config.name,
        add: config.server,
        port: String(config.port),
        id: config.uuid || '',
        aid: String(config.alterId || 0),
        scy: config.security || 'auto',
        net: config.network || 'tcp',
        type: 'none',
        host: config.host || '',
        path: config.path || '',
        tls: config.security === 'tls' ? 'tls' : '',
        sni: config.sni || '',
      };
      return 'vmess://' + btoa(JSON.stringify(obj));
    }
    case 'vless': {
      const params = new URLSearchParams();
      if (config.security) params.set('security', config.security);
      if (config.network) params.set('type', config.network);
      if (config.path) params.set('path', config.path);
      if (config.host) params.set('host', config.host);
      if (config.sni) params.set('sni', config.sni);
      if (config.pbk) params.set('pbk', config.pbk);
      if (config.sid) params.set('sid', config.sid);
      if (config.fp) params.set('fp', config.fp);
      if (config.spiderX) params.set('spx', config.spiderX);
      if (config.flow) params.set('flow', config.flow);
      if (config.headerType) params.set('headerType', config.headerType);
      if (config.encryption) params.set('encryption', config.encryption);
      
      const base = `vless://${config.uuid}@${config.server}:${config.port}?${params.toString()}`;
      return config.name ? `${base}#${encodeURIComponent(config.name)}` : base;
    }
    case 'shadowsocks': {
      const auth = btoa(`${config.method}:${config.password}`);
      return `ss://${auth}@${config.server}:${config.port}#${encodeURIComponent(config.name)}`;
    }
    case 'trojan': {
      const params = new URLSearchParams();
      if (config.network) params.set('type', config.network);
      if (config.path) params.set('path', config.path);
      if (config.host) params.set('host', config.host);
      if (config.sni) params.set('sni', config.sni);
      if (config.name) params.set('remark', config.name);
      return `trojan://${config.password}@${config.server}:${config.port}?${params.toString()}`;
    }
    default:
      return '';
  }
}
