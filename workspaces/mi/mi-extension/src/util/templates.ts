/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export function escapeXml(text: string) {

  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

export const rootPomXmlContent = (projectName: string, groupID: string, artifactID: string, projectUuid: string, version: string) => `<?xml version="1.0" encoding="UTF-8"?>
<project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd" xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <modelVersion>4.0.0</modelVersion>
  <groupId>${groupID}</groupId>
  <artifactId>${artifactID}</artifactId>
  <version>${version}</version>
  <packaging>pom</packaging>
  <name>${projectName}</name>
  <description>${projectName}</description>
  <repositories>
    <repository>
        <id>wso2-nexus</id>
        <name>WSO2 internal Repository</name>
        <url>https://maven.wso2.org/nexus/content/groups/wso2-public/</url>
        <releases>
          <enabled>true</enabled>
          <updatePolicy>daily</updatePolicy>
          <checksumPolicy>ignore</checksumPolicy>
        </releases>
    </repository>
    <repository>
        <id>wso2.releases</id>
        <name>WSO2 internal Repository</name>
        <url>https://maven.wso2.org/nexus/content/repositories/releases/</url>
        <releases>
          <enabled>true</enabled>
          <updatePolicy>daily</updatePolicy>
          <checksumPolicy>ignore</checksumPolicy>
        </releases>
    </repository>
    <repository>
        <id>wso2.snapshots</id>
        <name>Apache Snapshot Repository</name>
        <url>https://maven.wso2.org/nexus/content/repositories/snapshots/</url>
        <snapshots>
          <enabled>true</enabled>
          <updatePolicy>daily</updatePolicy>
        </snapshots>
        <releases>
          <enabled>false</enabled>
        </releases>
    </repository>
  </repositories>
  <pluginRepositories>
    <pluginRepository>
      <id>wso2.snapshots</id>
      <name>Apache Snapshot Repository</name>
      <url>https://maven.wso2.org/nexus/content/repositories/snapshots/</url>
      <snapshots>
        <enabled>true</enabled>
        <updatePolicy>daily</updatePolicy>
      </snapshots>
      <releases>
        <enabled>false</enabled>
      </releases>
    </pluginRepository>
    <pluginRepository>
      <releases>
        <enabled>true</enabled>
        <updatePolicy>daily</updatePolicy>
        <checksumPolicy>ignore</checksumPolicy>
      </releases>
      <id>wso2-nexus</id>
      <url>https://maven.wso2.org/nexus/content/groups/wso2-public/</url>
    </pluginRepository>
  </pluginRepositories>
  <profiles>
    <profile>
      <id>default</id>
      <activation>
        <activeByDefault>true</activeByDefault>
      </activation>
      <build>
        <plugins>
          <!-- Download dependency jars to the deployment/libs folder -->
          <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-dependency-plugin</artifactId>
            <version>3.5.0</version>
            <executions>
              <execution>
                <phase>process-resources</phase>
                <goals>
                  <goal>copy-dependencies</goal>
                </goals>
                <configuration>
                  <outputDirectory>\${basedir}/deployment/libs</outputDirectory>
                  <excludeTransitive>true</excludeTransitive>
                  <!-- exclude dependencies which already available in MI -->
                  <excludeGroupIds>org.apache.synapse,org.apache.axis2</excludeGroupIds>
                </configuration>
              </execution>
            </executions>
          </plugin>
          <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
              <source>1.8</source>
              <target>1.8</target>
            </configuration>
          </plugin>
          <plugin>
            <groupId>org.wso2.maven</groupId>
            <artifactId>vscode-car-plugin</artifactId>
            <version>5.2.65</version>
            <extensions>true</extensions>
            <executions>
              <execution>
                <goals>
                  <goal>car</goal>
                </goals>
                <configuration/>
              </execution>
            </executions>
          </plugin>
          <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-install-plugin</artifactId>
            <version>2.5.2</version>
            <executions>
              <execution>
                <id>install-car</id>
                <phase>compile</phase>
                <goals>
                  <goal>install-file</goal>
                </goals>
                <configuration>
                  <packaging>car</packaging>
                  <artifactId>\${project.artifactId}</artifactId>
                  <groupId>\${project.groupId}</groupId>
                  <version>\${project.version}</version>
                  <file>\${project.build.directory}/\${project.artifactId}_\${project.version}.car</file>
                  <!-- Use the following configuration when archiveLocation is configured -->
                  <!-- <file>\${archiveLocation}/\${project.artifactId}_\${project.version}.car</file> -->
                </configuration>
              </execution>
            </executions>
          </plugin>
          <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-antrun-plugin</artifactId>
            <version>3.1.0</version>
            <executions>
              <execution>
                <id>setup-env</id>
                <phase>generate-test-resources</phase>
                <goals>
                  <goal>run</goal>
                </goals>
                <configuration>
                  <target>
                    <mkdir dir="\${local.mi.pack.store.path}" />
                    <get src="\${mi.pack.download.link}"
                       dest="\${local.mi.pack.store.path}"/>
                    <unzip src="\${local.mi.pack.store.path}/\${mi.pack}.zip" dest="\${local.mi.pack.store.path}" />
                    <exec executable="chmod">
                      <arg value="+x"/>
                      <arg value="\${local.mi.pack.store.path}/\${mi.pack}/bin/micro-integrator.sh"/>
                    </exec>
                  </target>
                  <skip>\${maven.test.skip}</skip>
                </configuration>
              </execution>
              <execution>
                <id>delete-folder</id>
                <phase>post-integration-test</phase>
                <configuration>
                  <target>
                    <delete dir="\${local.mi.pack.store.path}" />
                  </target>
                  <skip>\${maven.test.skip}</skip>
                </configuration>
                <goals>
                  <goal>run</goal>
                </goals>
              </execution>
            </executions>
          </plugin>
        </plugins>
      </build>
      <properties>
        <server.type>local</server.type>
        <server.host>localhost</server.host>
        <server.port>9008</server.port>
        <server.path>\${local.mi.pack.store.path}/\${mi.pack}/bin/micro-integrator.sh</server.path>
      </properties>
    </profile>
    <profile>
      <id>docker</id>
      <build>
        <plugins>
            <!-- Compile and build the class mediator jars -->
            <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <executions>
              <execution>
                <id>default-compile</id>
                <phase>generate-sources</phase>
                <goals>
                  <goal>compile</goal>
                </goals>
              </execution>
            </executions>
            <configuration>
              <source>1.8</source>
              <target>1.8</target>
            </configuration>
          </plugin>
          <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <executions>
              <execution>
                <id>default-jar</id>
                <phase>generate-sources</phase>
                <goals>
                  <goal>jar</goal>
                </goals>
              </execution>
            </executions>
          </plugin>
          <!-- Build the Carbon Application -->
          <plugin>
            <groupId>org.wso2.maven</groupId>
            <artifactId>vscode-car-plugin</artifactId>
            <version>5.2.65</version>
            <extensions>true</extensions>
            <executions>
              <execution>
                <phase>generate-sources</phase>
                <goals>
                  <goal>car</goal>
                </goals>
                <configuration></configuration>
              </execution>
            </executions>
          </plugin>
          <!-- Download dependency jars to the deployment/libs folder -->
          <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-dependency-plugin</artifactId>
            <version>3.5.0</version>
            <executions>
              <execution>
                <phase>process-resources</phase>
                <goals>
                  <goal>copy-dependencies</goal>
                </goals>
                <configuration>
                  <outputDirectory>\${basedir}/deployment/libs</outputDirectory>
                  <excludeTransitive>true</excludeTransitive>
                  <!-- exclude dependencies which already available in MI -->
                  <excludeGroupIds>org.apache.synapse,org.apache.axis2</excludeGroupIds>
                </configuration>
              </execution>
            </executions>
          </plugin>
          <!-- Run config mapper to transform configuration files -->
          <plugin>
            <groupId>org.wso2.maven</groupId>
            <artifactId>mi-container-config-mapper</artifactId>
            <version>5.2.65</version>
            <extensions>true</extensions>
            <executions>
              <execution>
                <id>config-mapper-parser</id>
                <phase>generate-resources</phase>
                <goals>
                  <goal>config-mapper-parser</goal>
                </goals>
                <configuration>
                  <miVersion>4.3.0</miVersion>
                  <executeCipherTool>\${ciphertool.enable}</executeCipherTool>
                  <keystoreName>\${keystore.name}</keystoreName>
                  <keystoreAlias>\${keystore.alias}</keystoreAlias>
                  <keystoreType>\${keystore.type}</keystoreType>
                  <keystorePassword>\${keystore.password}</keystorePassword>
                  <projectLocation>\${project.basedir}</projectLocation>
                </configuration>
              </execution>
            </executions>
            <configuration/>
          </plugin>
          <plugin>
            <artifactId>maven-antrun-plugin</artifactId>
            <version>3.0.0</version>
            <extensions>true</extensions>
            <executions>
              <execution>
                <id>antrun-edit</id>
                <phase>process-resources</phase>
                <goals>
                  <goal>run</goal>
                </goals>
                <configuration>
                  <target>
                    <copy todir="\${basedir}/target/tmp_docker/CompositeApps">
                      <fileset dir="\${basedir}/target">
                        <include name="*.car"/>
                      </fileset>
                    </copy>
                    <move todir="\${basedir}/target/tmp_docker/CarbonHome/metadata">
                      <fileset dir="\${basedir}/target/tmp_docker/CarbonHome/.metadata"/>
                    </move>
                    <replace file="\${basedir}/target/tmp_docker/Dockerfile">
                      <replacefilter token="CarbonHome/.metadata/metadata_config.properties" value="CarbonHome/metadata/metadata_config.properties"/>
                      <replacefilter token="CarbonHome/.metadata/references.properties" value="CarbonHome/metadata/references.properties"/>
                    </replace>
                  </target>
                </configuration>
              </execution>
            </executions>
            <configuration/>
          </plugin>
          <!-- Build docker image -->
          <plugin>
            <groupId>io.fabric8</groupId>
            <artifactId>docker-maven-plugin</artifactId>
            <version>0.43.4</version>
            <extensions>true</extensions>
            <executions>
              <execution>
                <id>docker-build</id>
                <phase>compile</phase>
                <goals>
                  <goal>build</goal>
                </goals>
                <configuration>
                  <images>
                    <image>
                      <name>\${project.artifactId}:\${project.version}</name>
                      <build>
                        <from>\${dockerfile.base.image}</from>
                        <dockerFile>\${basedir}/target/tmp_docker/Dockerfile</dockerFile>
                        <args>
                          <BASE_IMAGE>\${dockerfile.base.image}</BASE_IMAGE>
                        </args>
                      </build>
                    </image>
                  </images>
                  <authConfig>
                    <username>\${dockerfile.pull.username}</username>
                    <password>\${dockerfile.pull.password}</password>
                  </authConfig>
                  <verbose>true</verbose>
                </configuration>
              </execution>
              <execution>
                <id>docker-start</id>
                <phase>generate-test-resources</phase>
                <goals>
                  <goal>start</goal>
                </goals>
                <configuration>
                  <autoPull>always</autoPull>
                  <images>
                    <image>
                      <name>\${dockerfile.base.image}</name>
                      <alias>\${docker.container.name}</alias>
                      <run>
                        <platform>linux/amd64</platform>
                        <ports>
                          <port>9008:9008</port>
                        </ports>
                        <wait>
                          <log>.*Synapse unit testing agent has been established on port 9008.*</log>
                          <time>100000</time>
                          <shutdown>100000</shutdown>
                        </wait>
                        <cmd>-DsynapseTest -DsynapseTestPort=9008</cmd>
                      </run>
                    </image>
                  </images>
                  <authConfig>
                    <username>\${dockerfile.pull.username}</username>
                    <password>\${dockerfile.pull.password}</password>
                  </authConfig>
                  <skip>\${maven.test.skip}</skip>
                </configuration>
              </execution>
              <execution>
                <id>docker-stop</id>
                <phase>post-integration-test</phase>
                <goals>
                  <goal>stop</goal>
                </goals>
                <configuration>
                  <images>
                    <image>
                      <name>\${docker.container.name}</name>
                    </image>
                  </images>
                  <authConfig>
                    <username>\${dockerfile.pull.username}</username>
                    <password>\${dockerfile.pull.password}</password>
                  </authConfig>
                  <skip>\${maven.test.skip}</skip>
                </configuration>
              </execution>
            </executions>
            <configuration/>
          </plugin>
        </plugins>
      </build>
      <properties>
        <server.type>remote</server.type>
        <server.host>localhost</server.host>
        <server.port>9008</server.port>
      </properties>
    </profile>
    <profile>
      <id>test</id>
      <build/>
      <properties>
        <server.type>\${testServerType}</server.type>
        <server.host>\${testServerHost}</server.host>
        <server.port>\${testServerPort}</server.port>
        <server.port>\${testServerPath}</server.port>
      </properties>
    </profile>
  </profiles>
  <build>
    <plugins>
      <plugin>
        <groupId>org.wso2.maven</groupId>
        <artifactId>synapse-unit-test-maven-plugin</artifactId>
        <version>5.2.65</version>
        <executions>
          <execution>
            <id>synapse-unit-test</id>
            <phase>test</phase>
            <goals>
              <goal>synapse-unit-test</goal>
            </goals>
          </execution>
        </executions>
        <configuration>
          <server>
            <testServerType>\${server.type}</testServerType>
            <testServerHost>\${server.host}</testServerHost>
            <testServerPort>\${server.port}</testServerPort>
            <testServerPath>\${server.path}</testServerPath>
          </server>
          <testCasesFilePath>\${project.basedir}/src/test/wso2mi/\${testFile}</testCasesFilePath>
          <mavenTestSkip>\${maven.test.skip}</mavenTestSkip>
        </configuration>
      </plugin>
    </plugins>
  </build>
  <properties>
    <projectType>integration-project</projectType>
    <uuid>${projectUuid}</uuid>
    <!-- <archiveLocation>configure a custom target directory for CAPP</archiveLocation> -->
    <keystore.type>JKS</keystore.type>
    <keystore.name>wso2carbon.jks</keystore.name>
    <keystore.password>wso2carbon</keystore.password>
    <keystore.alias>wso2carbon</keystore.alias>
    <ciphertool.enable>true</ciphertool.enable>
    <dockerfile.base.image>wso2/wso2mi:4.3.0</dockerfile.base.image>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <project.scm.id>integration-project</project.scm.id>
    <project.runtime.version>4.3.0</project.runtime.version>
    <docker.container.name>wso2-mi-container</docker.container.name>
    <local.mi.pack.store.path>\${basedir}/src/test/resources/product</local.mi.pack.store.path>
    <mi.pack.download.link>https://github.com/wso2/micro-integrator/releases/download/v4.3.0/wso2mi-4.3.0.zip</mi.pack.download.link>
    <mi.pack>wso2mi-4.3.0</mi.pack>
  </properties>
</project>`;

export const dockerfileContent = () => `ARG BASE_IMAGE
FROM \${BASE_IMAGE}
COPY CompositeApps/*.car \${WSO2_SERVER_HOME}/repository/deployment/server/carbonapps/
COPY resources/wso2carbon.jks \${WSO2_SERVER_HOME}/repository/resources/security/wso2carbon.jks
COPY resources/client-truststore.jks \${WSO2_SERVER_HOME}/repository/resources/security/client-truststore.jks
# COPY libs/*.jar \${WSO2_SERVER_HOME}/lib/`;
