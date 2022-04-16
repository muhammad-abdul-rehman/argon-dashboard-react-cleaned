import OnlyHeader from "components/Headers/OnlyHeader";
import React from "react";

// reactstrap components
import {
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  Pagination,
  PaginationItem,
  PaginationLink,
  Progress,
  Table,
  Container,
  Row,
  Col,
  UncontrolledTooltip,
  Navbar,
  NavLink,
} from "reactstrap";

//MUI
import { DataGrid } from "@material-ui/data-grid";

import fileIcons from "../../variables/file-icons";

import { connect } from "react-redux";
import { setUserLoginDetails } from "features/user/userSlice";
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  Drawer,
  IconButton,
  Button,
  Link,
  LinearProgress,
  Breadcrumbs,
} from "@material-ui/core";
import ListItemButton from "@material-ui/core/Button";

import "file-viewer";

class Filr extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      drawer: false,
      selectedFile: {},
      viewFiles: [],
      viewLoading: false,
      currentFolder: null,
    };
    this.breadcrumbs = [];
  }

  componentDidMount() {
    if (this.state.files.length === 0)
      this.fetchFiles(
        this.props.rcp_url.proxy_domain +
          this.props.rcp_url.base_wp_url +
          "filr"
      );
  }

  componentDidUpdate(
    prevProps,
    { files: prevFiles, viewFiles: prevViewFiles }
  ) {
    if (this.state.files.length !== 0 && prevFiles !== this.state.files) {
      this.setState({
        viewFiles: this.state.files.filter(
          (el) => el.metadata["assigned-folder"] === undefined
        ),
      });
    }
    if (prevViewFiles !== this.state.viewFiles) {
      const index = this.breadcrumbs.findIndex(
        (item) => item.key == this.state.currentFolder
      );

      if (index !== -1) {
        this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
      } else {
        const folder = this.state.files.find(
          (el) => el.id == this.state.currentFolder
        );
        //use indexes to clear up breadcrumbs.
        if (folder !== undefined && folder?.metadata["assigned-folder"] != 0) {
          this.breadcrumbs.push(
            <Link underline="hover" key={folder.id} color="inherit" href="#">
              {folder?.title.rendered}
            </Link>
          );
        } else if (folder !== undefined) {
          this.breadcrumbs = [
            <Link underline="hover" key={folder?.id} color="inherit" href="#">
              {folder?.title.rendered}
            </Link>,
          ];
        }
      }
    }
  }

  fetchFiles = async (url) => {
    const queryUrl = new URL(url);
    const params = {
      per_page: 100,
    };
    for (let key in params) {
      queryUrl.searchParams.set(key, params[key]);
    }
    const res = await fetch(queryUrl);
    const data = await res.json();
    this.setState({ files: data });
  };

  openFolder = (item) => {
    this.setState({
      viewLoading: true,
      currentFolder: item.id,
      viewFiles: this.state.files.filter((el) => {
        return (
          el.metadata.hasOwnProperty("assigned-folder") &&
          el.metadata["assigned-folder"] == item.id
        );
      }),
    });
    document.querySelectorAll(".folder-icon").forEach((el) => {
      if (el.classList.contains("fa-folder-open") || el.dataset.id == item.id) {
        el.classList.toggle("fa-folder-open");
      }
    });
    // @todo fetch from api
    setTimeout(() => {
      this.setState({ viewLoading: false });
    }, 2000);
  };

  render() {
    const columns = [
      {
        field: "name",
        headerName: "Name",
        width: 180,
        renderCell: (params) => {
          return (
            <div
              className="d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
            >
              <i
                className={
                  (typeof params.row.fileIcon === "string"
                    ? params.row.fileIcon
                    : "fa fa-file text-red") + " mr-2"
                }
                style={{ fontSize: "1rem" }}
              />
              <Link
                onClick={() => {
                  if (params.row.isFolder) {
                    this.openFolder(params.row);
                  } else {
                    this.setState({
                      selectedFile: params.row,
                      drawer: true,
                    });
                  }
                }}
              >
                {params.row.name}
              </Link>
            </div>
          );
        },
      },
      {
        field: "modified",
        headerName: "Modified Date",
        width: 180,
      },
      {
        field: "status",
        headerName: "Status",
        width: 180,
      },
    ];
    const rows = [];
    return (
      <>
        <OnlyHeader />
        <Container className="mt--8" fluid>
          <Row>
            <div className="col">
              <Card className="shadow">
                <CardHeader className="border-0">
                  <h3 className="mb-0">Filr</h3>
                </CardHeader>
                <CardBody>
                  <Breadcrumbs maxItems={3}>{this.breadcrumbs}</Breadcrumbs>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Navbar className="p-0">
                        <List className="w-100">
                          {this.state.files.length !== 0 &&
                            this.state.files
                              .filter(
                                (el) =>
                                  el.metadata["is-folder"]?.includes("true") &&
                                  el.metadata["assigned-folder"] === "0"
                              )
                              .map((item, key) => (
                                <NavLink key={key}>
                                  <ListItem>
                                    <ListItemButton
                                      startIcon={
                                        <i
                                          className="fa fa-folder text-orange folder-icon"
                                          data-id={item.id}
                                        />
                                      }
                                      className="w-100 justify-content-start text-capitalize folder-buttons"
                                      onClick={this.openFolder.bind(this, item)}
                                    >
                                      {item.title.rendered.slice(0, 20) + "..."}
                                    </ListItemButton>
                                  </ListItem>
                                </NavLink>
                              ))}
                        </List>
                      </Navbar>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <List>
                        {this.state.files.length !== 0 &&
                          // this.state.files
                          //   .filter(
                          //     (el) =>
                          //       el.metadata["assigned-folder"] === undefined
                          //   )
                          this.state.viewFiles.map((item, key) => {
                            const isFolder =
                              item.hasOwnProperty("metadata") &&
                              item.metadata.hasOwnProperty("is-folder") &&
                              item.metadata["is-folder"] === "true"
                                ? true
                                : false;
                            const fileType =
                              !isFolder &&
                              item.metadata["file-download"]?.split(".").pop();
                            const fileUrl = isFolder
                              ? null
                              : item.metadata["file-download"];
                            const fileIcon = isFolder
                              ? "fa fa-folder text-orange"
                              : fileIcons
                                  .filter((el) => el.type.includes(fileType))
                                  ?.pop()?.icon;
                            //console.log(fileIcon);  @todo it return undefined after a while.
                            rows.push({
                              id: item.id,
                              fileUrl: fileUrl,
                              fileType: fileType,
                              fileIcon: fileIcon,
                              name: item.title.rendered,
                              modified: item.modified,
                              status: item.status,
                              isFolder: isFolder,
                            });

                            // return (
                            //   <>
                            //     <ListItem key={key}>
                            //       <ListItemButton
                            // onClick={() =>
                            //   this.setState({
                            //     selectedFile: item,
                            //     drawer: true,
                            //   })
                            // }
                            //         className="w-100 text-capitalize justify-content-start"
                            //       >
                            //         <ListItemIcon className="fs-2 justify-content-center">
                            //           <i
                            //             className={
                            //               typeof fileIcon === "string"
                            //                 ? fileIcon
                            //                 : "fa fa-file"
                            //             }
                            //           />
                            //         </ListItemIcon>
                            //         {item.title.rendered}
                            //       </ListItemButton>
                            //     </ListItem>
                            //   </>
                            // );
                          })}
                        <DataGrid
                          loading={this.state.viewLoading}
                          components={{
                            LoadingOverlay: LinearProgress,
                          }}
                          checkboxSelection
                          autoHeight
                          rows={rows}
                          columns={columns}
                        />
                      </List>
                    </Grid>
                  </Grid>
                </CardBody>
              </Card>
              <Drawer anchor="left" open={this.state.drawer}>
                {Object.keys(this.state.selectedFile).length !== 0 && (
                  <>
                    <Row
                      style={{ width: window.innerWidth * 0.75 }}
                      className="pt-3 pl-3"
                    >
                      <Col xs={8}>
                        <h2>{this.state.selectedFile.name}</h2>
                      </Col>
                      <Col
                        className="d-flex justify-content-end  align-items-center"
                        xs={4}
                      >
                        <IconButton
                          className="p-2 mr-3"
                          onClick={() => this.setState({ drawer: false })}
                          size="small"
                        >
                          <i
                            className="fa fa-plus"
                            style={{ transform: "rotate(45deg)" }}
                          />
                        </IconButton>
                      </Col>
                    </Row>
                    <file-viewer
                      style={{ height: "80%" }}
                      id="file-viewer"
                      filename={this.state.selectedFile.name}
                      url={this.state.selectedFile.fileUrl}
                    ></file-viewer>
                    <Row className="mt-3">
                      <Col xs={6}></Col>
                      <Col xs={6} className="d-flex justify-content-center">
                        <Button className="mr-2" variant="contained">
                          <a
                            className="text-black"
                            href={this.state.selectedFile.fileUrl}
                            target="_blank"
                          >
                            Download
                          </a>
                        </Button>
                        <Button
                          onClick={() => this.setState({ drawer: false })}
                          variant="outlined"
                        >
                          Cancel
                        </Button>
                      </Col>
                    </Row>
                  </>
                )}
              </Drawer>
            </div>
          </Row>
        </Container>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    rcp_url: state.rcp_url,
    user: state.user,
  };
};

const mapDispatchToProps = { setUserLoginDetails };

export default connect(mapStateToProps, mapDispatchToProps)(Filr);
