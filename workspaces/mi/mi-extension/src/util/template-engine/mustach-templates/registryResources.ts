/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { render } from "mustache";

export function getRegistryResource(type: string, resourceName: string) {
    switch (type) {
        case "Address Endpoint":
            return render(getAddressEndpoint(), { name: resourceName });
        case "Default Endpoint":
            return render(getDefaultEndpoint(), { name: resourceName });
        case "Failover Endpoint":
            return render(getFailoverEndpointTemplate(), { name: resourceName });
        case "HTTP Endpoint":
            return render(getHTTPEndpoint(), { name: resourceName });
        case "Load Balance Endpoint":
            return render(getLoadbalanceEndpointTemplate(), { name: resourceName });
        case "Recipient List Endpoint":
            return render(getRecipientListEndpointTemplate(), { name: resourceName });
        case "Template Endpoint":
            return render(getTemplateEndpoint(), { name: resourceName });
        case "WSDL Endpoint":
            return render(getWSDLEndpoint(), { name: resourceName });
        case "Default Endpoint Template":
            return render(getDefaultEndpointTemplate(), { name: resourceName });
        case "HTTP Endpoint Template":
            return render(getHTTPEndpointTemplate(), { name: resourceName });
        case "WSDL Endpoint Template":
            return render(getWSDLEndpointTemplate(), { name: resourceName });
        case "Address endpoint template":
            return render(getAddressEndpointTemplate(), { name: resourceName });
        case "Local Entry":
            return render(getLocalEntryTemplate(), { name: resourceName });
        case "Sequence":
            return render(getSequence(), { name: resourceName });
        case "Sequence Template":
            return render(getSequenceTemplate(), { name: resourceName });
        case "WSDL File":
            return getWSDLFileTemplate();
        case "WS-Policy":
            return getWSPolicyTemplate();
        case "XSD File":
            return getXSDTemplate();
        case "XSLT File":
        case "XSL File":
            return getXSLTemplate();
    }
}

export function getAddressEndpoint() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <endpoint name="{{name}}" xmlns="http://ws.apache.org/ns/synapse">
        <address uri="https://localhost">
            <suspendOnFailure>
                <initialDuration>-1</initialDuration>
                <progressionFactor>1.0</progressionFactor>
            </suspendOnFailure>
            <markForSuspension>
                <retriesBeforeSuspension>0</retriesBeforeSuspension>
            </markForSuspension>
        </address>
    </endpoint>`;
}

export function getDefaultEndpoint() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <endpoint name="{{name}}" xmlns="http://ws.apache.org/ns/synapse">
        <default>
            <suspendOnFailure>
                <initialDuration>-1</initialDuration>
                <progressionFactor>1.0</progressionFactor>
            </suspendOnFailure>
            <markForSuspension>
                <retriesBeforeSuspension>0</retriesBeforeSuspension>
            </markForSuspension>
        </default>
    </endpoint>`;
}

export function getFailoverEndpointTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <endpoint name="{{name}}" xmlns="http://ws.apache.org/ns/synapse">
        <failover>
            <endpoint name="endpoint_urn_uuid_6179155B57847314A656794419902014617670556">
                <address uri="http://localhost">
                    <suspendOnFailure>
                        <initialDuration>-1</initialDuration>
                        <progressionFactor>1</progressionFactor>
                    </suspendOnFailure>
                    <markForSuspension>
                        <retriesBeforeSuspension>0</retriesBeforeSuspension>
                    </markForSuspension>
                </address>
            </endpoint>
        </failover>
        <description/>
    </endpoint>`;
}

export function getHTTPEndpoint() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <endpoint name="{{name}}" xmlns="http://ws.apache.org/ns/synapse">
        <http method="get" uri-template="https://localhost">
            <suspendOnFailure>
                <initialDuration>-1</initialDuration>
                <progressionFactor>1.0</progressionFactor>
            </suspendOnFailure>
            <markForSuspension>
                <retriesBeforeSuspension>0</retriesBeforeSuspension>
            </markForSuspension>
        </http>
    </endpoint>`;
}

export function getLoadbalanceEndpointTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <endpoint name="{{name}}" xmlns="http://ws.apache.org/ns/synapse">
        <loadbalance algorithm="org.apache.synapse.endpoints.algorithms.RoundRobin">
            <endpoint name="endpoint_urn_uuid_6179155B57847314A657084710149040-304004407">
                <address uri="http://localhost">
                    <suspendOnFailure>
                        <initialDuration>-1</initialDuration>
                        <progressionFactor>1</progressionFactor>
                    </suspendOnFailure>
                    <markForSuspension>
                        <retriesBeforeSuspension>0</retriesBeforeSuspension>
                    </markForSuspension>
                </address>
            </endpoint>
        </loadbalance>
        <description/>
    </endpoint>`;
}

export function getRecipientListEndpointTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <endpoint name="{{name}}" xmlns="http://ws.apache.org/ns/synapse">
        <recipientlist>
            <endpoint>
                <default>
                    <suspendOnFailure>
                        <initialDuration>-1</initialDuration>
                        <progressionFactor>1</progressionFactor>
                    </suspendOnFailure>
                    <markForSuspension>
                        <retriesBeforeSuspension>0</retriesBeforeSuspension>
                    </markForSuspension>
                </default>
            </endpoint>
        </recipientlist>
        <description/>
    </endpoint>`;
}

export function getTemplateEndpoint() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <endpoint name="{{name}}" template="" uri="https://localhost" xmlns="http://ws.apache.org/ns/synapse">
        <description/>
    </endpoint>`;
}

export function getWSDLEndpoint() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <endpoint name="{{name}}" xmlns="http://ws.apache.org/ns/synapse">
        <wsdl port="SimpleStockQuoteServiceHttpSoap11Endpoint" service="SimpleStockQuoteService" uri="http://localhost:9000/services/SimpleStockQuoteService?wsdl">
            <suspendOnFailure>
                <initialDuration>-1</initialDuration>
                <progressionFactor>1.0</progressionFactor>
            </suspendOnFailure>
            <markForSuspension>
                <retriesBeforeSuspension>0</retriesBeforeSuspension>
            </markForSuspension>
        </wsdl>
    </endpoint>`;
}

export function getDefaultEndpointTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <template name="{{name}}" xmlns="http://ws.apache.org/ns/synapse">
        <endpoint name="$name">
            <default>
                <suspendOnFailure>
                    <initialDuration>-1</initialDuration>
                    <progressionFactor>1.0</progressionFactor>
                </suspendOnFailure>
                <markForSuspension>
                    <retriesBeforeSuspension>0</retriesBeforeSuspension>
                </markForSuspension>
            </default>
        </endpoint>
    </template>`;
}

export function getHTTPEndpointTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <template name="{{name}}" xmlns="http://ws.apache.org/ns/synapse">
        <endpoint name="$name">
            <http method="get" uri-template="https://localhost">
                <suspendOnFailure>
                    <initialDuration>-1</initialDuration>
                    <progressionFactor>1.0</progressionFactor>
                </suspendOnFailure>
                <markForSuspension>
                    <retriesBeforeSuspension>0</retriesBeforeSuspension>
                </markForSuspension>
            </http>
        </endpoint>
    </template>`;
}

export function getWSDLEndpointTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <template name="{{name}}" xmlns="http://ws.apache.org/ns/synapse">
        <endpoint name="$name">
            <wsdl port="SimpleStockQuoteServiceHttpSoap11Endpoint" service="SimpleStockQuoteService" uri="http://localhost:9000/services/SimpleStockQuoteService?wsdl">
                <suspendOnFailure>
                    <initialDuration>-1</initialDuration>
                    <progressionFactor>1.0</progressionFactor>
                </suspendOnFailure>
                <markForSuspension>
                    <retriesBeforeSuspension>0</retriesBeforeSuspension>
                </markForSuspension>
            </wsdl>
        </endpoint>
    </template>`;
}

export function getAddressEndpointTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <template xmlns="http://ws.apache.org/ns/synapse" name="{{name}}">
        <endpoint name="$name">
            <address uri="<1>">
                <suspendOnFailure>
                    <progressionFactor>1.0</progressionFactor>
                </suspendOnFailure>
                <markForSuspension>
                    <retriesBeforeSuspension>0</retriesBeforeSuspension>
                    <retryDelay>0</retryDelay>
                </markForSuspension>
            </address>
        </endpoint>
    </template>`;
}

export function getLocalEntryTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <localEntry key="localentry" xmlns="http://ws.apache.org/ns/synapse"><![CDATA[entry_value]]></localEntry>`;
}

export function getSequence() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <sequence name="{{name}}" trace="disable" xmlns="http://ws.apache.org/ns/synapse"/>`;
}

export function getSequenceTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <template name="{{name}}" xmlns="http://ws.apache.org/ns/synapse">
        <sequence/>
    </template>`;
}

export function getWSDLFileTemplate() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <wsdl:definitions xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
        xmlns:tns="http://www.example.org/NewWSDLFile/" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="NewWSDLFile"
        targetNamespace="http://www.example.org/NewWSDLFile/">
        <wsdl:types>
            <xsd:schema targetNamespace="http://www.example.org/NewWSDLFile/">
                <xsd:element name="NewOperation">
                    <xsd:complexType>
                        <xsd:sequence>
                            <xsd:element name="in" type="xsd:string" />
                        </xsd:sequence>
                    </xsd:complexType>
                </xsd:element>
                <xsd:element name="NewOperationResponse">
                    <xsd:complexType>
                        <xsd:sequence>
                            <xsd:element name="out" type="xsd:string" />
                        </xsd:sequence>
                    </xsd:complexType>
                </xsd:element>
            </xsd:schema>
        </wsdl:types>
        <wsdl:message name="NewOperationRequest">
            <wsdl:part element="tns:NewOperation" name="parameters" />
        </wsdl:message>
        <wsdl:message name="NewOperationResponse">
            <wsdl:part element="tns:NewOperationResponse" name="parameters" />
        </wsdl:message>
        <wsdl:portType name="NewWSDLFile">
            <wsdl:operation name="NewOperation">
                <wsdl:input message="tns:NewOperationRequest" />
                <wsdl:output message="tns:NewOperationResponse" />
            </wsdl:operation>
        </wsdl:portType>
        <wsdl:binding name="NewWSDLFileSOAP" type="tns:NewWSDLFile">
            <soap:binding style="document"
                transport="http://schemas.xmlsoap.org/soap/http" />
            <wsdl:operation name="NewOperation">
                <soap:operation soapAction="http://www.example.org/NewWSDLFile/NewOperation" />
                <wsdl:input>
                    <soap:body use="literal" />
                </wsdl:input>
                <wsdl:output>
                    <soap:body use="literal" />
                </wsdl:output>
            </wsdl:operation>
        </wsdl:binding>
        <wsdl:service name="wsdl">
            <wsdl:port binding="tns:NewWSDLFileSOAP" name="wsdlSOAP">
                <soap:address location="http://www.example.org/" />
            </wsdl:port>
        </wsdl:service>
    </wsdl:definitions>`;
}

function getWSPolicyTemplate() {
    return `<wsp:Policy wsu:Id="UTOverTransport"
	xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"
	xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy">
	<wsp:ExactlyOne>
		<wsp:All>
			<sp:TransportBinding
				xmlns:sp="http://schemas.xmlsoap.org/ws/2005/07/securitypolicy">
				<wsp:Policy>
					<sp:TransportToken>
						<wsp:Policy>
							<sp:HttpsToken RequireClientCertificate="false" />
						</wsp:Policy>
					</sp:TransportToken>
					<sp:AlgorithmSuite>
						<wsp:Policy>
							<sp:Basic256 />
						</wsp:Policy>
					</sp:AlgorithmSuite>
					<sp:Layout>
						<wsp:Policy>
							<sp:Lax />
						</wsp:Policy>
					</sp:Layout>
					<sp:IncludeTimestamp />
				</wsp:Policy>
			</sp:TransportBinding>
			<sp:SignedSupportingTokens
				xmlns:sp="http://schemas.xmlsoap.org/ws/2005/07/securitypolicy">
				<wsp:Policy>
					<sp:UsernameToken
						sp:IncludeToken="http://schemas.xmlsoap.org/ws/2005/07/securitypolicy/IncludeToken/AlwaysToRecipient" />
				</wsp:Policy>
			</sp:SignedSupportingTokens>
		</wsp:All>
	</wsp:ExactlyOne>
	<rampart:RampartConfig xmlns:rampart="http://ws.apache.org/rampart/policy">
		<rampart:user>wso2carbon</rampart:user>
		<rampart:encryptionUser>useReqSigCert</rampart:encryptionUser>
		<rampart:timestampPrecisionInMilliseconds>true
		</rampart:timestampPrecisionInMilliseconds>
		<rampart:timestampTTL>300</rampart:timestampTTL>
		<rampart:timestampMaxSkew>300</rampart:timestampMaxSkew>
		<rampart:timestampStrict>false</rampart:timestampStrict>
		<rampart:tokenStoreClass>org.wso2.carbon.security.util.SecurityTokenStore
		</rampart:tokenStoreClass>
		<rampart:nonceLifeTime>300</rampart:nonceLifeTime>
	</rampart:RampartConfig>
	<sec:CarbonSecConfig xmlns:sec="http://www.wso2.org/products/carbon/security">
		<sec:Authorization>
			<sec:property name="org.wso2.carbon.security.allowedroles"></sec:property>
		</sec:Authorization>
	</sec:CarbonSecConfig>
</wsp:Policy>`;
}

function getXSDTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    </xs:schema>`;
}

function getXSLTemplate() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <xsl:stylesheet version="1.0"
        xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
        <xsl:template match="/">
            <!-- TODO: Auto-generated template -->
        </xsl:template>
    </xsl:stylesheet>`;
}
